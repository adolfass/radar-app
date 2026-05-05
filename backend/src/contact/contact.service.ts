import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { EncryptionService } from '../encryption/encryption.service';
import { AddContactByRefDto } from './dto/add-contact-by-ref.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
    private encryption: EncryptionService,
  ) {}

  async findAll(userId: number, search?: string) {
    const where: any = { userId };
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { personalData: { contains: search, mode: 'insensitive' } },
      ];
    }
    const contacts = await this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
    return contacts.map((contact) => this.decryptPrivateMeta(contact));
  }

  async findOne(id: number, userId: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.userId !== userId) {
      throw new NotFoundException('Contact not found');
    }
    return this.decryptPrivateMeta(contact);
  }

  async addByRef(userId: number, addDto: AddContactByRefDto) {
    const { contactId, refUserId, privateMeta } = addDto;
    const businessCard = await this.prisma.businessCard.findUnique({
      where: { contactId },
      include: { user: true },
    });
    if (!businessCard) throw new NotFoundException('Business card not found');

    const existingContact = await this.prisma.contact.findUnique({
      where: { userId_contactId: { userId, contactId } },
    });
    if (existingContact) {
      return {
        message: 'Contact already exists',
        contact: this.decryptPrivateMeta(existingContact),
      };
    }

    const encryptedPrivateMeta = privateMeta ? this.encryption.encryptJSON(privateMeta) : null;

    const contact = await this.prisma.contact.create({
      data: {
        userId,
        contactId,
        businessName: businessCard.businessName,
        resources: businessCard.resources,
        personalData: businessCard.personalData,
        privateMeta: encryptedPrivateMeta,
      },
    });

    if (refUserId) {
      const referrerNumericId = typeof refUserId === 'string' ? parseInt(refUserId) : refUserId;
      await this.referralService.processReferral(userId, referrerNumericId, 'contact_added');
    }

    return this.decryptPrivateMeta(contact);
  }

  async updatePrivateMeta(id: number, userId: number, privateMeta: Record<string, unknown>) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.userId !== userId) {
      throw new NotFoundException('Contact not found');
    }

    const encryptedPrivateMeta = this.encryption.encryptJSON(privateMeta);

    const updated = await this.prisma.contact.update({
      where: { id },
      data: { privateMeta: encryptedPrivateMeta },
    });

    return this.decryptPrivateMeta(updated);
  }

  async remove(id: number, userId: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.userId !== userId) {
      throw new NotFoundException('Contact not found');
    }
    await this.prisma.contact.delete({ where: { id } });
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
    ]
      .filter(Boolean)
      .join('\n');
    return { vcard, filename: `${contact.businessName || 'contact'}.vcf` };
  }

  private decryptPrivateMeta(contact: any) {
    if (contact.privateMeta) {
      try {
        contact.privateMeta = this.encryption.decryptJSON(contact.privateMeta);
      } catch {
        contact.privateMeta = null;
      }
    }
    return contact;
  }

  async getPublicProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Unknown',
      username: user.username,
      photoUrl: user.photoUrl,
    };
  }

  async addByQrExchange(userId: number, targetUserId: number) {
    const existing = await this.prisma.contact.findFirst({
      where: { userId, contactId: `user_${targetUserId}` },
    });
    if (existing) {
      return { success: true, contact: existing, alreadyExists: true, message: 'Контакт уже в сети' };
    }
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, username: true, photoUrl: true },
    });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }
    const contact = await this.prisma.contact.create({
      data: {
        userId,
        contactId: `user_${targetUserId}`,
        businessName: [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || targetUser.username || 'Unknown',
        personalData: JSON.stringify({
          fullName: [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' '),
          username: targetUser.username,
        }),
        resources: JSON.stringify({}),
        isActive: true,
      },
    });
    return { success: true, contact, alreadyExists: false, message: 'Контакт добавлен' };
  }
}
