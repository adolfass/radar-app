import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCardDto } from './dto/create-business-card.dto';
import { UpdateBusinessCardDto } from './dto/update-business-card.dto';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BusinessCardService {
  private frontendUrl: string;
  private botUsername: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    this.botUsername = this.configService.get('TELEGRAM_BOT_USERNAME') || 'radar_test_bot';
  }

  private getShareLink(contactId: string): string {
    return `https://t.me/${this.botUsername}?startapp=${contactId}`;
  }

  private getWebLink(contactId: string): string {
    return `${this.frontendUrl}/card/${contactId}`;
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
