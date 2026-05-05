import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ReferralService {
  private readonly STARS_FOR_MONTH = 100;
  private readonly STARS_FOR_YEAR = 500;
  private botUsername: string;

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private configService: ConfigService,
    private subscriptionService: SubscriptionService,
  ) {
    this.botUsername = this.configService.get('TELEGRAM_BOT_USERNAME') || 'radar_strateg_space_bot';
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async generateLink(userId: number): Promise<{ code: string; link: string }> {
    let user = await this.userService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.referralCode) {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: { referralCode: this.generateReferralCode() },
      });
    }

    const link = `https://t.me/${this.botUsername}?start=ref_${user.referralCode}`;
    return { code: user.referralCode!, link };
  }

  async getInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        earnedStars: true,
        redeemedStars: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { code, link } = await this.generateLink(userId);

    const balance = user.earnedStars - user.redeemedStars;
    const referredCount = await this.prisma.referralEvent.count({
      where: { referrerId: userId, status: 'ACTIVE' },
    });

    return {
      code,
      link,
      earned: user.earnedStars,
      redeemed: user.redeemedStars,
      balance,
      referredCount,
      milestones: {
        monthAvailable: balance >= this.STARS_FOR_MONTH,
        yearAvailable: balance >= this.STARS_FOR_YEAR,
      },
    };
  }

  async trackRegistration(referrerId: number, newUserId: number) {
    if (referrerId === newUserId) {
      throw new BadRequestException('Нельзя реферерить самого себя');
    }

    const existingEvent = await this.prisma.referralEvent.findUnique({
      where: {
        referrerId_referredId: {
          referrerId,
          referredId: newUserId,
        },
      },
    });

    if (existingEvent) {
      if (existingEvent.status === 'ACTIVE') {
        return { alreadyExists: true, message: 'Реферал уже зарегистрирован' };
      }
      if (existingEvent.status === 'PENDING') {
        await this.prisma.referralEvent.update({
          where: { id: existingEvent.id },
          data: { status: 'ACTIVE' },
        });
        await this.prisma.user.update({
          where: { id: referrerId },
          data: { earnedStars: { increment: 1 } },
        });
        return { success: true, message: 'Реферал активирован, +1 звезда' };
      }
    }

    await this.prisma.referralEvent.create({
      data: {
        referrerId,
        referredId: newUserId,
        starsAwarded: 1,
        status: 'ACTIVE',
      },
    });

    await this.prisma.user.update({
      where: { id: referrerId },
      data: { earnedStars: { increment: 1 } },
    });

    return { success: true, message: 'Реферал зарегистрирован, +1 звезда' };
  }

  async redeemStars(userId: number, type: 'MONTH' | 'YEAR') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const balance = user.earnedStars - user.redeemedStars;
    const requiredStars = type === 'MONTH' ? this.STARS_FOR_MONTH : this.STARS_FOR_YEAR;

    if (balance < requiredStars) {
      throw new BadRequestException(`Недостаточно звёзд. Нужно ${requiredStars}, в наличии ${balance}`);
    }

    const months = type === 'MONTH' ? 1 : 12;
    await this.subscriptionService.upgradeToPremium(userId, months);

    await this.prisma.user.update({
      where: { id: userId },
      data: { redeemedStars: { increment: requiredStars } },
    });

    const updatedUser = await this.prisma.user.findUnique({ where: { id: userId } });
    const newBalance = (updatedUser!.earnedStars || 0) - (updatedUser!.redeemedStars || 0);

    return {
      success: true,
      type,
      months,
      newBalance,
      message: `Подписка Premium на ${months} ${months === 1 ? 'месяц' : 'месяцев'} активирована!`,
    };
  }

  async getHistory(userId: number, page = 1, limit = 20) {
    const events = await this.prisma.referralEvent.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        referred: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          },
        },
      },
    });

    const total = await this.prisma.referralEvent.count({
      where: { referrerId: userId },
    });

    return {
      data: events,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async processStartParam(startParam: string, userId: number): Promise<{ referrerId: number; code: string } | null> {
    if (!startParam || !startParam.startsWith('ref_')) {
      return null;
    }

    const code = startParam.replace('ref_', '');
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!referrer || referrer.id === userId) {
      return null;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { referredById: referrer.id.toString() },
    });

    await this.trackRegistration(referrer.id, userId);

    return { referrerId: referrer.id, code };
  }

  async processReferral(userId: number, referrerId: number, action: string) {
    if (action === 'contact_added') {
      return this.trackRegistration(referrerId, userId);
    }
    return { success: true, message: 'Action not tracked' };
  }
}