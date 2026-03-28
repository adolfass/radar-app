import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReferralService {
  private referralPoints: number = 10; // Points for each successful referral
  private frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
  }

  async processReferral(userId: number, referrerId: number, action: string) {
    // Convert referrerId from string to number if needed
    const referrerNumericId = typeof referrerId === 'string' ? parseInt(referrerId) : referrerId;

    // Check if referral relationship exists
    const existingReferral = await this.prisma.referral.findUnique({
      where: {
        userId_referrerId: {
          userId,
          referrerId: referrerNumericId,
        },
      },
    });

    // Create referral relationship if it doesn't exist
    if (!existingReferral) {
      await this.prisma.referral.create({
        data: {
          userId,
          referrerId: referrerNumericId,
        },
      });
    }

    // Log the referral action
    const points = action === 'contact_added' ? this.referralPoints : 0;

    await this.prisma.referralLog.create({
      data: {
        userId,
        referrerId: referrerNumericId,
        action,
        points,
      },
    });

    // Add points to referrer's balance
    if (points > 0) {
      await this.userService.updateBalance(referrerNumericId, points);
    }

    return { points };
  }

  async getStats(userId: number) {
    const totalReferrals = await this.prisma.referral.count({
      where: { referrerId: userId },
    });

    const totalPoints = await this.prisma.referralLog.aggregate({
      where: { referrerId: userId },
      _sum: { points: true },
    });

    const recentLogs = await this.prisma.referralLog.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      totalReferrals,
      totalPoints: totalPoints._sum.points || 0,
      recentActivity: recentLogs,
    };
  }

  async getLogs(userId: number) {
    return this.prisma.referralLog.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async generateReferralLink(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate a unique link for this user
    // In a real app, you might want to create a short link or use a different mechanism
    return {
      link: `${this.frontendUrl}?ref_user_id=${userId}`,
      userId: user.telegramId.toString(),
    };
  }
}
