import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async getAllUsers(adminId: number, page = 1, limit = 20, search?: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin?.isOrganizer) {
      throw new ForbiddenException('Admin access required');
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { telegramId: isNaN(Number(search)) ? undefined : BigInt(search) },
      ].filter(Boolean);
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          isOrganizer: true,
          isPremium: true,
          balance: true,
          createdAt: true,
          _count: {
            select: {
              contacts: true,
              businessCards: true,
              referrals: true,
              meetings: true,
            },
          },
          subscription: {
            select: {
              plan: true,
              isActive: true,
              expiresAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserStats(adminId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin?.isOrganizer) {
      throw new ForbiddenException('Admin access required');
    }

    const [totalUsers, premiumUsers, organizers, newUsersToday, newUsersThisWeek] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isPremium: true } }),
        this.prisma.user.count({ where: { isOrganizer: true } }),
        this.prisma.user.count({
          where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        this.prisma.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

    return {
      totalUsers,
      premiumUsers,
      organizers,
      newUsersToday,
      newUsersThisWeek,
      freeUsers: totalUsers - premiumUsers,
    };
  }

  async toggleBanUser(adminId: number, targetUserId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin?.isOrganizer) {
      throw new ForbiddenException('Admin access required');
    }

    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.isOrganizer) {
      throw new ForbiddenException('Cannot ban organizers');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isOrganizer: false },
    });
  }
}
