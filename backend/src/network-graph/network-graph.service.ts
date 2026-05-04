import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GraphNode {
  id: number;
  label: string;
  group: string;
  archetype: string | null;
  size: number;
  val: number;
}

export interface GraphLink {
  source: number;
  target: number;
  value: number;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

@Injectable()
export class NetworkGraphService {
  constructor(private prisma: PrismaService) {}

  async getNetworkGraph(userId: number): Promise<GraphData> {
    const contacts = await this.prisma.contact.findMany({
      where: { userId },
    });

    const trustInteractions = await this.prisma.trustInteraction.findMany({
      where: { userId },
      select: { contactId: true, balanceDelta: true },
    });

    const trustByContactId = new Map<number, number[]>();
    for (const ti of trustInteractions) {
      if (!trustByContactId.has(ti.contactId)) {
        trustByContactId.set(ti.contactId, []);
      }
      trustByContactId.get(ti.contactId)!.push(ti.balanceDelta);
    }

    const nodes: GraphNode[] = contacts.map((contact) => {
      const deltas = trustByContactId.get(contact.id) || [];
      const totalTrust = deltas.reduce((sum, d) => sum + d, 0);

      let group = 'development';
      if (totalTrust > 50) group = 'support';
      else if (totalTrust > 10) group = 'productivity';

      return {
        id: contact.id,
        label: contact.businessName || 'Unknown',
        group,
        archetype: contact.archetype,
        size: Math.max(3, Math.min(15, 3 + deltas.length * 0.5)),
        val: Math.max(1, Math.min(10, 1 + Math.abs(totalTrust) * 0.1)),
      };
    });

    const links: GraphLink[] = [];

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contactA = contacts[i];
        const contactB = contacts[j];

        const similarity = this.calculateSimilarity(contactA, contactB);

        if (similarity > 0.3) {
          links.push({
            source: contactA.id,
            target: contactB.id,
            value: similarity * 3,
            label: similarity > 0.7 ? 'strong' : similarity > 0.5 ? 'medium' : 'weak',
          });
        }
      }
    }

    return { nodes, links };
  }

  private calculateSimilarity(a: any, b: any): number {
    let similarity = 0;

    const resourcesA = a.resources ? JSON.parse(a.resources) : {};
    const resourcesB = b.resources ? JSON.parse(b.resources) : {};
    const personalA = a.personalData ? JSON.parse(a.personalData) : {};
    const personalB = b.personalData ? JSON.parse(b.personalData) : {};

    const industriesA = personalA.industries || [];
    const industriesB = personalB.industries || [];
    const industryOverlap = industriesA.filter((i: string) => industriesB.includes(i)).length;
    if (industryOverlap > 0) similarity += 0.3 * Math.min(industryOverlap, 2);

    const citiesA = personalA.cities || [];
    const citiesB = personalB.cities || [];
    const cityOverlap = citiesA.filter((c: string) => citiesB.includes(c)).length;
    if (cityOverlap > 0) similarity += 0.2;

    const tagsA = Object.keys(resourcesA);
    const tagsB = Object.keys(resourcesB);
    const tagOverlap = tagsA.filter((t) => tagsB.includes(t)).length;
    if (tagOverlap > 0) similarity += 0.2 * Math.min(tagOverlap, 2);

    if (a.circle && b.circle && a.circle === b.circle) similarity += 0.15;

    return Math.min(1, similarity);
  }
}
