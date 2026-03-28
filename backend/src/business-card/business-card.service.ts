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

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
  }

  async findAll(userId: number) {
    return this.prisma.businessCard.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
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

    return card;
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

    return card;
  }

  async create(userId: number, createDto: CreateBusinessCardDto) {
    const contactId = uuidv4();
    
    // Generate QR code URL (in production, save to S3/storage)
    const qrData = `${this.frontendUrl}/card/${contactId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    
    // For now, we'll store a placeholder. In production, save to S3
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
    if (updateDto.resources !== undefined) updateData.resources = JSON.stringify(updateDto.resources);
    if (updateDto.personalData !== undefined) updateData.personalData = JSON.stringify(updateDto.personalData);

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
    return `${this.frontendUrl}/card/${contactId}?ref_user_id=${refUserId}`;
  }
}
