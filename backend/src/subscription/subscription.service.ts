import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  private readonly DEFAULT_TRIAL_DAYS = 14;
  private readonly CONTACT_LIMIT_FREE = 100;
  private readonly CONTACT_LIMIT_PREMIUM = Infinity;

  constructor(private prisma: PrismaService) {}

  async getSubscription(userId: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return this.createDefaultSubscription(userId);
    }

    return this.enforceExpiry(subscription);
  }

  async activateTrial(userId: number, days?: number) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing?.plan === 'premium') {
      throw new BadRequestException('User already has premium subscription');
    }

    if (existing?.plan === 'free' && existing.trialEnd) {
      throw new BadRequestException('Trial has already been used');
    }

    const trialDays = days || this.DEFAULT_TRIAL_DAYS;
    const now = new Date();
    const trialStart = now;
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: 'free',
        isActive: true,
        trialStart,
        trialEnd,
        expiresAt,
      },
      update: {
        plan: 'free',
        isActive: true,
        trialStart,
        trialEnd,
        expiresAt,
      },
    });

    return subscription;
  }

  async upgradeToPremium(userId: number, months?: number) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Subscription not found');
    }

    const premiumMonths = months || 1;
    const now = new Date();
    const baseDate = existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now;
    const expiresAt = new Date(baseDate.getTime() + premiumMonths * 30 * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'premium',
        isActive: true,
        expiresAt,
      },
    });

    return subscription;
  }

  async checkContactLimit(userId: number, currentCount: number) {
    const subscription = await this.getSubscription(userId);
    const limit =
      subscription.plan === 'premium' ? this.CONTACT_LIMIT_PREMIUM : this.CONTACT_LIMIT_FREE;

    return {
      allowed: currentCount < limit,
      limit: limit === Infinity ? -1 : limit,
      current: currentCount,
      plan: subscription.plan,
    };
  }

  async isPremium(userId: number): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription.plan === 'premium' && subscription.isActive;
  }

  private async createDefaultSubscription(userId: number) {
    return this.prisma.subscription.create({
      data: {
        userId,
        plan: 'free',
        isActive: true,
      },
    });
  }

  private enforceExpiry(subscription: any) {
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      return {
        ...subscription,
        isActive: false,
        plan: 'free' as const,
      };
    }
    return subscription;
  }
}
