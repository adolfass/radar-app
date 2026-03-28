import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { AddContactByRefDto } from './dto/add-contact-by-ref.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {}

  async findAll(userId: number, search?: string) {
    const where: any = { userId };
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { personalData: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact || contact.userId !== userId) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async addByRef(userId: number, addDto: AddContactByRefDto) {
    const { contactId, refUserId } = addDto;

    // Get business card by contactId
    const businessCard = await this.prisma.businessCard.findUnique({
      where: { contactId },
      include: { user: true },
    });

    if (!businessCard) {
      throw new NotFoundException('Business card not found');
    }

    // Check if contact already exists
    const existingContact = await this.prisma.contact.findUnique({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });

    if (existingContact) {
      return { message: 'Contact already exists', contact: existingContact };
    }

    // Add contact
    const contact = await this.prisma.contact.create({
      data: {
        userId,
        contactId,
        businessName: businessCard.businessName,
        resources: businessCard.resources,
        personalData: businessCard.personalData,
      },
    });

    // Process referral if refUserId is provided
    if (refUserId) {
      const referrerNumericId = typeof refUserId === 'string' ? parseInt(refUserId) : refUserId;
      await this.referralService.processReferral(userId, referrerNumericId, 'contact_added');
    }

    return contact;
  }

  async remove(id: number, userId: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact || contact.userId !== userId) {
      throw new NotFoundException('Contact not found');
    }

    await this.prisma.contact.delete({
      where: { id },
    });

    return { message: 'Contact removed' };
  }

  async exportVCard(id: number, userId: number) {
    const contact = await this.findOne(id, userId);

    const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
    const resources = contact.resources ? JSON.parse(contact.resources) : {};

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${personalData.fullName || contact.businessName || 'Contact'}`,
      personalData.phone ? `TEL:${personalData.phone}` : '',
      personalData.email ? `EMAIL:${personalData.email}` : '',
      personalData.position ? `TITLE:${personalData.position}` : '',
      contact.businessName ? `ORG:${contact.businessName}` : '',
      resources.website ? `URL:${resources.website}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');

    return {
      vcard,
      filename: `${contact.businessName || 'contact'}.vcf`,
    };
  }
}
