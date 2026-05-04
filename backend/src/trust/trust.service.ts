import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogTrustDto } from './dto/log-trust.dto';

@Injectable()
export class TrustService {
  constructor(private prisma: PrismaService) {}

  async adjustTrust(userId: number, contactId: number, amount: number, reason?: string) {
    if (amount < -100 || amount > 100) {
      throw new BadRequestException('Amount must be between -100 and +100');
    }

    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.userId !== userId) {
      throw new BadRequestException('Contact does not belong to this user');
    }

    const type = amount > 0 ? 'increase' : amount < 0 ? 'decrease' : 'neutral';

    return this.prisma.trustInteraction.create({
      data: {
        userId,
        contactId,
        type,
        description: reason || `Manual adjustment: ${amount > 0 ? '+' : ''}${amount}`,
        balanceDelta: amount,
      },
      include: {
        contact: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });
  }

  async logInteraction(
    userId: number,
    contactId: number,
    type: string,
    description: string | undefined,
    balanceDelta: number,
  ) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.userId !== userId) {
      throw new BadRequestException('Contact does not belong to this user');
    }

    return this.prisma.trustInteraction.create({
      data: {
        userId,
        contactId,
        type,
        description,
        balanceDelta,
      },
      include: {
        contact: {
          select: {
            id: true,
            businessName: true,
            circle: true,
          },
        },
      },
    });
  }

  async getTrustBalance(userId: number, contactId: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.userId !== userId) {
      throw new BadRequestException('Contact does not belong to this user');
    }

    const result = await this.prisma.trustInteraction.aggregate({
      where: { userId, contactId },
      _sum: { balanceDelta: true },
    });

    return {
      contactId,
      contactName: contact.businessName || contact.contactId,
      balance: result._sum.balanceDelta || 0,
    };
  }

  async getTrustHistory(userId: number, contactId?: number) {
    const where: any = { userId };
    if (contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }

      if (contact.userId !== userId) {
        throw new BadRequestException('Contact does not belong to this user');
      }

      where.contactId = contactId;
    }

    return this.prisma.trustInteraction.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            businessName: true,
            circle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTopTrustedContacts(userId: number, limit = 10) {
    const interactions = await this.prisma.trustInteraction.groupBy({
      by: ['contactId'],
      where: { userId },
      _sum: { balanceDelta: true },
      orderBy: {
        _sum: { balanceDelta: 'desc' },
      },
      take: limit,
    });

    const contactIds = interactions.map((i) => i.contactId);

    if (contactIds.length === 0) {
      return [];
    }

    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: contactIds } },
      select: {
        id: true,
        businessName: true,
        contactId: true,
        circle: true,
        archetype: true,
      },
    });

    const contactMap = new Map(contacts.map((c) => [c.id, c]));

    return interactions.map((interaction) => {
      const contact = contactMap.get(interaction.contactId);
      return {
        contactId: interaction.contactId,
        contactName: contact?.businessName || contact?.contactId || 'Unknown',
        circle: contact?.circle,
        archetype: contact?.archetype,
        balance: interaction._sum.balanceDelta || 0,
      };
    });
  }
}
