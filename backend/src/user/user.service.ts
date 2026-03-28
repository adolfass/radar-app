import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        businessCards: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        referrals: {
          include: {
            referrer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isOrganizer: user.isOrganizer,
      balance: user.balance,
      businessCardsCount: user.businessCards.length,
      contactsCount: user.contacts.length,
      referralsCount: user.referrals.length,
      businessCards: user.businessCards,
      contacts: user.contacts,
    };
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByTelegramId(telegramId: bigint) {
    return this.prisma.user.findUnique({
      where: { telegramId },
    });
  }

  async updateBalance(userId: number, amount: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async setOrganizerStatus(userId: number, isOrganizer: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isOrganizer },
    });
  }
}
