import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RitualService {
  constructor(private prisma: PrismaService) {}

  async startRitual(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingActive = await this.prisma.reviewRitual.findFirst({
      where: {
        userId,
        status: 'in_progress',
      },
    });

    if (existingActive) {
      throw new BadRequestException('You already have an active ritual');
    }

    const snapshot = await this.computeNetworkHealth(userId);

    const ritual = await this.prisma.reviewRitual.create({
      data: {
        userId,
        startedAt: new Date(),
        status: 'in_progress',
      },
    });

    return { ritual, snapshot };
  }

  async completeRitual(userId: number, ritualId: number, metrics: Record<string, unknown>) {
    const ritual = await this.prisma.reviewRitual.findFirst({
      where: {
        id: ritualId,
        userId,
        status: 'in_progress',
      },
    });

    if (!ritual) {
      throw new NotFoundException('Active ritual not found');
    }

    const completed = await this.prisma.reviewRitual.update({
      where: { id: ritualId },
      data: {
        completedAt: new Date(),
        status: 'completed',
        metrics: JSON.stringify(metrics),
      },
    });

    const snapshot = await this.computeNetworkHealth(userId);

    return { ritual: completed, snapshot };
  }

  async getActiveRitual(userId: number) {
    return this.prisma.reviewRitual.findFirst({
      where: {
        userId,
        status: 'in_progress',
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getRitualHistory(userId: number) {
    return this.prisma.reviewRitual.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async computeNetworkHealth(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const contacts = await this.prisma.contact.findMany({
      where: { userId, isActive: true },
    });

    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(
      (c) =>
        c.lastInteraction &&
        new Date(c.lastInteraction) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    ).length;

    const supportCircle = contacts.filter((c) => c.circle === 'support').length;
    const productivityCircle = contacts.filter((c) => c.circle === 'productivity').length;
    const developmentCircle = contacts.filter((c) => c.circle === 'development').length;

    const diversity =
      totalContacts > 0
        ? 1 - Math.max(supportCircle, productivityCircle, developmentCircle) / totalContacts
        : 0;

    const freshness = totalContacts > 0 ? activeContacts / totalContacts : 0;

    const trustInteractions = await this.prisma.trustInteraction.findMany({
      where: { userId },
      select: { balanceDelta: true },
    });

    const trustBalance = trustInteractions.reduce((sum, i) => sum + i.balanceDelta, 0);

    const density = totalContacts > 1 ? Math.min(1, (totalContacts - 1) / 100) : 0;

    const snapshot = await this.prisma.networkHealthSnapshot.create({
      data: {
        userId,
        density,
        diversity,
        freshness,
        trustBalance,
        totalContacts,
        activeContacts,
        supportCircle,
        productivityCircle,
        developmentCircle,
      },
    });

    return snapshot;
  }

  async getNetworkHealthHistory(userId: number) {
    return this.prisma.networkHealthSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
