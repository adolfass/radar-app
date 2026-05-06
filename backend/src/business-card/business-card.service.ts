import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCardDto } from './dto/create-business-card.dto';
import { UpdateBusinessCardDto } from './dto/update-business-card.dto';
import { ShareBusinessCardDto } from './dto/share-business-card.dto';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BusinessCardService {
  private frontendUrl: string;
  private botUsername: string;
  private shareSecret: string;
  private readonly TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    this.botUsername = this.configService.get('TELEGRAM_BOT_USERNAME') || 'radar_test_bot';
    this.shareSecret = this.configService.get('SHARE_SECRET') || 'dev-secret-change-in-production';
  }

  private getShareLink(contactId: string): string {
    return `https://t.me/${this.botUsername}?startapp=${contactId}`;
  }

  private getSignedShareLink(contactId: string, includePrivate: boolean = false): string {
    const exp = Date.now() + this.TOKEN_EXPIRY_MS;
    const payload = JSON.stringify({ contactId, includePrivate, exp });
    const signature = crypto
      .createHmac('sha256', this.shareSecret)
      .update(payload)
      .digest('hex');
    const token = Buffer.from(`${payload}.${signature}`).toString('base64url');
    return `https://t.me/${this.botUsername}?startapp=share_${token}`;
  }

  async verifyShareToken(token: string): Promise<{ contactId: string; includePrivate: boolean }> {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const [payloadStr, signature] = decoded.split('.');

      const expected = crypto
        .createHmac('sha256', this.shareSecret)
        .update(payloadStr)
        .digest('hex');

      if (signature !== expected) {
        throw new BadRequestException('Invalid share token signature');
      }

      const payload = JSON.parse(payloadStr);

      if (payload.exp < Date.now()) {
        throw new BadRequestException('Share link has expired');
      }

      return { contactId: payload.contactId, includePrivate: payload.includePrivate };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid or expired share token');
    }
  }

  async generateShareLink(cardId: number, userId: number, dto: ShareBusinessCardDto) {
    const card = await this.prisma.businessCard.findUnique({ where: { id: cardId } });

    if (!card || !card.isActive) {
      throw new NotFoundException('Business card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const link = this.getSignedShareLink(card.contactId, dto.includePrivate);
    const qrCodeDataUrl = await QRCode.toDataURL(link, { width: 300, margin: 2 });

    return { link, qrCodeDataUrl, expiresIn: '24 hours' };
  }

  async findAll(userId: number) {
    const cards = await this.prisma.businessCard.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const cardsWithQr = await Promise.all(
      cards.map(async (card) => {
        const shareLink = this.getShareLink(card.contactId);
        const qrCodeDataUrl = await QRCode.toDataURL(shareLink, { width: 200, margin: 2 });
        return {
          ...card,
          shareLink,
          qrCodeDataUrl,
        };
      }),
    );

    return cardsWithQr;
  }

  async findOne(id: number, userId: number) {
    const card = await this.prisma.businessCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Business card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const shareLink = this.getShareLink(card.contactId);
    const qrCodeDataUrl = await QRCode.toDataURL(shareLink, { width: 200, margin: 2 });

    return {
      ...card,
      shareLink,
      qrCodeDataUrl,
    };
  }

  async findByContactId(contactId: string) {
    const card = await this.prisma.businessCard.findUnique({
      where: { contactId },
      include: {
        user: {
          select: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!card || !card.isActive) {
      throw new NotFoundException('Business card not found');
    }

    return {
      ...card,
      user: {
        ...card.user,
        telegramId: card.user.telegramId.toString(),
      },
    };
  }

  async create(userId: number, createDto: CreateBusinessCardDto) {
    const existingCards = await this.prisma.businessCard.count({
      where: { userId, isActive: true }
    });
    
    if (existingCards >= 1) {
      throw new BadRequestException('Вы можете иметь только одну визитку. Отредактируйте существующую.');
    }

    const contactId = uuidv4();

    const qrData = this.getShareLink(contactId);
    await QRCode.toDataURL(qrData);

    const qrCodeUrl = `/api/qr/${contactId}`;

    return this.prisma.businessCard.create({
      data: {
        userId,
        contactId,
        businessName: createDto.businessName,
        resources: JSON.stringify(createDto.resources || {}),
        personalData: JSON.stringify(createDto.personalData || {}),
        qrCodeUrl,
        isActive: true,
      },
    });
  }

  async update(id: number, userId: number, updateDto: UpdateBusinessCardDto) {
    const card = await this.prisma.businessCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Business card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};
    if (updateDto.businessName !== undefined) updateData.businessName = updateDto.businessName;
    if (updateDto.resources !== undefined)
      updateData.resources = JSON.stringify(updateDto.resources);
    if (updateDto.personalData !== undefined)
      updateData.personalData = JSON.stringify(updateDto.personalData);

    return this.prisma.businessCard.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number, userId: number) {
    const card = await this.prisma.businessCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Business card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.businessCard.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async generateReferralLink(userId: number, contactId: string, refUserId: number) {
    return this.getShareLink(contactId) + `?ref_user_id=${refUserId}`;
  }

  async generateQrCode(contactId: string) {
    const card = await this.prisma.businessCard.findUnique({
      where: { contactId },
    });

    if (!card || !card.isActive) {
      throw new NotFoundException('Business card not found');
    }

    const qrData = this.getShareLink(contactId);
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
    });

    return { qrCodeDataUrl, contactId };
  }
}
