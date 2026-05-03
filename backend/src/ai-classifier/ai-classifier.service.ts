import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum ContactCircle {
  SUPPORT = 'support',
  PRODUCTIVITY = 'productivity',
  DEVELOPMENT = 'development',
}

export enum ContactRole {
  CONNECTOR = 'connector',
  BRIDGE = 'bridge',
  GATEKEEPER = 'gatekeeper',
  CONDENSATOR = 'condensator',
}

export enum RecommendationType {
  ARCHIVE = 'archive',
  UNFREEZE = 'unfreeze',
  STRENGTHEN = 'strengthen',
  MEET = 'meet',
  INTRODUCE = 'introduce',
}

export interface ContactAnalysis {
  contactId: number;
  businessName: string | null;
  circle: ContactCircle;
  circleScore: number;
  roles: ContactRole[];
  roleScores: Record<ContactRole, number>;
  recommendation?: Recommendation;
}

export interface Recommendation {
  type: RecommendationType;
  priority: number;
  reason: string;
  action: string;
}

export interface NetworkSummary {
  totalContacts: number;
  circleDistribution: Record<ContactCircle, number>;
  roleDistribution: Record<ContactRole, number>;
  missingRoles: ContactRole[];
  recommendations: Recommendation[];
  healthScore: number;
}

@Injectable()
export class AiClassifierService {
  private readonly logger = new Logger(AiClassifierService.name);

  constructor(private prisma: PrismaService) {}

  async classifyContact(contactId: number, userId: number): Promise<ContactAnalysis> {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        trustInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!contact || contact.userId !== userId) {
      throw new Error('Contact not found');
    }

    const meetings = await this.prisma.meeting.findMany({
      where: { userId, contactId: parseInt(contact.contactId, 10) },
      orderBy: { scheduledAt: 'desc' },
    });

    const contactWithMeetings = { ...contact, meetings };

    const circle = this.classifyCircle(contactWithMeetings);
    const roles = this.detectRoles(contactWithMeetings, userId);
    const recommendation = this.generateRecommendation(contactWithMeetings, circle, roles);

    return {
      contactId: contact.id,
      businessName: contact.businessName,
      circle,
      circleScore: this.calculateCircleScore(contactWithMeetings),
      roles,
      roleScores: this.calculateRoleScores(contactWithMeetings, userId),
      recommendation,
    };
  }

  async classifyAllContacts(userId: number): Promise<ContactAnalysis[]> {
    const contacts = await this.prisma.contact.findMany({
      where: { userId },
      include: {
        trustInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    const meetingsByContactId = await this.prisma.meeting.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'desc' },
    });

    const meetingsMap = new Map<number, any[]>();
    for (const meeting of meetingsByContactId) {
      const key = meeting.contactId;
      if (!meetingsMap.has(key)) {
        meetingsMap.set(key, []);
      }
      meetingsMap.get(key)!.push(meeting);
    }

    return contacts.map(contact => {
      const meetings = meetingsMap.get(parseInt(contact.contactId, 10)) || [];
      const contactWithMeetings = { ...contact, meetings };

      const circle = this.classifyCircle(contactWithMeetings);
      const roles = this.detectRoles(contactWithMeetings, userId);
      const recommendation = this.generateRecommendation(contactWithMeetings, circle, roles);

      return {
        contactId: contact.id,
        businessName: contact.businessName,
        circle,
        circleScore: this.calculateCircleScore(contactWithMeetings),
        roles,
        roleScores: this.calculateRoleScores(contactWithMeetings, userId),
        recommendation,
      };
    });
  }

  async getNetworkSummary(userId: number): Promise<NetworkSummary> {
    const analyses = await this.classifyAllContacts(userId);

    const circleDistribution: Record<ContactCircle, number> = {
      [ContactCircle.SUPPORT]: 0,
      [ContactCircle.PRODUCTIVITY]: 0,
      [ContactCircle.DEVELOPMENT]: 0,
    };

    const roleDistribution: Record<ContactRole, number> = {
      [ContactRole.CONNECTOR]: 0,
      [ContactRole.BRIDGE]: 0,
      [ContactRole.GATEKEEPER]: 0,
      [ContactRole.CONDENSATOR]: 0,
    };

    const recommendations: Recommendation[] = [];

    for (const analysis of analyses) {
      circleDistribution[analysis.circle]++;
      for (const role of analysis.roles) {
        roleDistribution[role]++;
      }
      if (analysis.recommendation) {
        recommendations.push(analysis.recommendation);
      }
    }

    const missingRoles = (Object.values(ContactRole) as ContactRole[]).filter(
      role => roleDistribution[role] === 0,
    );

    const healthScore = this.calculateHealthScore(analyses, circleDistribution);

    return {
      totalContacts: analyses.length,
      circleDistribution,
      roleDistribution,
      missingRoles,
      recommendations: recommendations.sort((a, b) => b.priority - a.priority).slice(0, 10),
      healthScore,
    };
  }

  private classifyCircle(contact: any): ContactCircle {
    const score = this.calculateCircleScore(contact);

    if (score >= 70) return ContactCircle.SUPPORT;
    if (score >= 30) return ContactCircle.PRODUCTIVITY;
    return ContactCircle.DEVELOPMENT;
  }

  private calculateCircleScore(contact: any): number {
    let score = 0;

    const interactions = contact.trustInteractions || [];
    const meetings = contact.meetings || [];

    const totalTrust = interactions.reduce((sum: number, i: any) => sum + (i.delta || 0), 0);
    const interactionCount = interactions.length;
    const meetingCount = meetings.length;

    const lastInteraction = interactions[0]?.createdAt || contact.createdAt;
    const daysSinceLastContact = Math.floor(
      (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24),
    );

    const daysKnown = Math.floor(
      (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (totalTrust > 50) score += 30;
    else if (totalTrust > 20) score += 20;
    else if (totalTrust > 0) score += 10;

    if (interactionCount > 10) score += 20;
    else if (interactionCount > 5) score += 15;
    else if (interactionCount > 2) score += 10;
    else if (interactionCount > 0) score += 5;

    if (meetingCount > 5) score += 20;
    else if (meetingCount > 2) score += 15;
    else if (meetingCount > 0) score += 10;

    if (daysSinceLastContact < 30) score += 15;
    else if (daysSinceLastContact < 90) score += 10;
    else if (daysSinceLastContact < 180) score += 5;

    if (daysKnown > 180) score += 15;
    else if (daysKnown > 90) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private detectRoles(contact: any, userId: number): ContactRole[] {
    const scores = this.calculateRoleScores(contact, userId);
    const threshold = 30;

    return (Object.values(ContactRole) as ContactRole[]).filter(
      role => scores[role] >= threshold,
    );
  }

  private calculateRoleScores(contact: any, userId: number): Record<ContactRole, number> {
    const interactions = contact.trustInteractions || [];
    const resources = contact.resources ? JSON.parse(contact.resources) : {};

    const scores: Record<ContactRole, number> = {
      [ContactRole.CONNECTOR]: 0,
      [ContactRole.BRIDGE]: 0,
      [ContactRole.GATEKEEPER]: 0,
      [ContactRole.CONDENSATOR]: 0,
    };

    scores[ContactRole.CONNECTOR] = this.calculateConnectorScore(contact);
    scores[ContactRole.BRIDGE] = this.calculateBridgeScore(contact);
    scores[ContactRole.GATEKEEPER] = this.calculateGatekeeperScore(contact, resources);
    scores[ContactRole.CONDENSATOR] = this.calculateCondensatorScore(contact, interactions);

    return scores;
  }

  private calculateConnectorScore(contact: any): number {
    let score = 0;

    if (contact.referralsGiven && contact.referralsGiven > 3) score += 40;
    else if (contact.referralsGiven && contact.referralsGiven > 1) score += 25;
    else if (contact.referralsGiven && contact.referralsGiven > 0) score += 15;

    const resources = contact.resources ? JSON.parse(contact.resources) : {};
    if (resources.network || resources.connections) score += 30;
    if (resources.partnerships) score += 20;

    return Math.min(100, score);
  }

  private calculateBridgeScore(contact: any): number {
    let score = 0;

    const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
    if (personalData.industries && personalData.industries.length > 1) score += 30;
    if (personalData.cities && personalData.cities.length > 1) score += 25;

    const resources = contact.resources ? JSON.parse(contact.resources) : {};
    if (resources.crossIndustry || resources.international) score += 40;

    return Math.min(100, score);
  }

  private calculateGatekeeperScore(contact: any, resources: any): number {
    let score = 0;

    if (resources.access || resources.exclusive) score += 40;
    if (resources.budget || resources.funding) score += 30;
    if (resources.decision || resources.authority) score += 30;

    const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
    if (personalData.position && (personalData.position.includes('директор') ||
        personalData.position.includes('director') ||
        personalData.position.includes('CEO') ||
        personalData.position.includes('руководитель'))) {
      score += 25;
    }

    return Math.min(100, score);
  }

  private calculateCondensatorScore(contact: any, interactions: any[]): number {
    let score = 0;

    const positiveInteractions = interactions.filter((i: any) => (i.delta || 0) > 0).length;
    const totalInteractions = interactions.length;

    if (totalInteractions > 0) {
      const positivityRatio = positiveInteractions / totalInteractions;
      score += Math.round(positivityRatio * 40);
    }

    if (totalInteractions > 10) score += 30;
    else if (totalInteractions > 5) score += 20;
    else if (totalInteractions > 2) score += 10;

    const resources = contact.resources ? JSON.parse(contact.resources) : {};
    if (resources.community || resources.events || resources.organizer) score += 30;

    return Math.min(100, score);
  }

  private generateRecommendation(
    contact: any,
    circle: ContactCircle,
    roles: ContactRole[],
  ): Recommendation | undefined {
    const interactions = contact.trustInteractions || [];
    const meetings = contact.meetings || [];

    const lastInteraction = interactions[0]?.createdAt || contact.createdAt;
    const daysSinceLastContact = Math.floor(
      (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalTrust = interactions.reduce((sum: number, i: any) => sum + (i.delta || 0), 0);

    if (daysSinceLastContact > 180 && totalTrust <= 0) {
      return {
        type: RecommendationType.ARCHIVE,
        priority: 3,
        reason: 'Нет контактов 6+ месяцев, баланс доверия нейтральный или отрицательный',
        action: 'Переместить в архив',
      };
    }

    if (daysSinceLastContact > 90 && daysSinceLastContact <= 180 && totalTrust > 0) {
      return {
        type: RecommendationType.UNFREEZE,
        priority: 5,
        reason: 'Активный контакт 3-6 месяцев назад, позитивный баланс доверия',
        action: 'Написать, напомнить о себе',
      };
    }

    if (totalTrust > 30 && daysSinceLastContact > 30) {
      return {
        type: RecommendationType.STRENGTHEN,
        priority: 7,
        reason: 'Высокий баланс доверия, но давно не общались',
        action: 'Назначить встречу или звонок',
      };
    }

    if (roles.includes(ContactRole.CONNECTOR) && daysSinceLastContact > 14) {
      return {
        type: RecommendationType.MEET,
        priority: 8,
        reason: 'Коннектор — важно поддерживать регулярный контакт',
        action: 'Встретиться в ближайшие 2 недели',
      };
    }

    if (circle === ContactCircle.DEVELOPMENT && daysSinceLastContact < 7) {
      return {
        type: RecommendationType.INTRODUCE,
        priority: 4,
        reason: 'Новый контакт из круга развития — можно связать с кем-то из продуктивности',
        action: 'Предложить знакомство с релевантным контактом',
      };
    }

    return undefined;
  }

  private calculateHealthScore(
    analyses: ContactAnalysis[],
    circleDistribution: Record<ContactCircle, number>,
  ): number {
    let score = 50;

    const total = analyses.length;
    if (total === 0) return 0;

    const supportRatio = circleDistribution[ContactCircle.SUPPORT] / total;
    const productivityRatio = circleDistribution[ContactCircle.PRODUCTIVITY] / total;
    const developmentRatio = circleDistribution[ContactCircle.DEVELOPMENT] / total;

    if (supportRatio >= 0.03 && supportRatio <= 0.1) score += 15;
    else if (supportRatio > 0.1) score += 5;

    if (productivityRatio >= 0.5 && productivityRatio <= 0.8) score += 15;
    else if (productivityRatio < 0.3) score -= 10;

    if (developmentRatio >= 0.2 && developmentRatio <= 0.4) score += 10;

    const hasRecommendations = analyses.filter(a => a.recommendation).length;
    const actionRatio = hasRecommendations / total;
    if (actionRatio < 0.3) score += 10;
    else if (actionRatio > 0.6) score -= 10;

    return Math.min(100, Math.max(0, score));
  }
}
