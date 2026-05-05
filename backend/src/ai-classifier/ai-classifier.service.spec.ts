import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  AiClassifierService,
  ContactCircle,
  ContactRole,
  RecommendationType,
} from './ai-classifier.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AiClassifierService', () => {
  let service: AiClassifierService;

  const mockPrisma = {
    contact: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    meeting: {
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:11434'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiClassifierService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiClassifierService>(AiClassifierService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('classifyContact', () => {
    const baseContact = {
      id: 1,
      userId: 1,
      contactId: '1',
      businessName: 'Test Contact',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      trustInteractions: [],
    };

    it('should classify as DEVELOPMENT for new contact with no interactions', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(baseContact);
      mockPrisma.meeting.findMany.mockResolvedValue([]);

      const result = await service.classifyContact(1, 1);

      expect(result.circle).toBe(ContactCircle.DEVELOPMENT);
      expect(result.contactId).toBe(1);
    });

    it('should classify as SUPPORT for high trust, frequent interactions', async () => {
      const interactions = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        delta: 5,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      }));

      const meetings = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        scheduledAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      }));

      mockPrisma.contact.findUnique.mockResolvedValue({
        ...baseContact,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        trustInteractions: interactions,
      });
      mockPrisma.meeting.findMany.mockResolvedValue(meetings);

      const result = await service.classifyContact(1, 1);

      expect(result.circle).toBe(ContactCircle.SUPPORT);
      expect(result.circleScore).toBeGreaterThan(70);
    });

    it('should classify as PRODUCTIVITY for moderate interactions', async () => {
      const interactions = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        delta: 3,
        createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      }));

      const meetings = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        scheduledAt: new Date(Date.now() - i * 14 * 24 * 60 * 60 * 1000),
      }));

      mockPrisma.contact.findUnique.mockResolvedValue({
        ...baseContact,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        trustInteractions: interactions,
      });
      mockPrisma.meeting.findMany.mockResolvedValue(meetings);

      const result = await service.classifyContact(1, 1);

      expect(result.circle).toBe(ContactCircle.PRODUCTIVITY);
    });

    it('should throw error for wrong userId', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ ...baseContact, userId: 2 });

      await expect(service.classifyContact(1, 1)).rejects.toThrow('Contact not found');
    });
  });

  describe('getNetworkSummary', () => {
    it('should return summary with circle distribution', async () => {
      const contacts = [
        {
          id: 1,
          userId: 1,
          contactId: '1',
          businessName: 'Contact 1',
          createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          trustInteractions: Array.from({ length: 15 }, (_, i) => ({
            id: i,
            delta: 5,
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          })),
        },
        {
          id: 2,
          userId: 1,
          contactId: '2',
          businessName: 'Contact 2',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          trustInteractions: [],
        },
      ];

      mockPrisma.contact.findMany.mockResolvedValue(contacts);
      mockPrisma.meeting.findMany.mockResolvedValue([]);

      const result = await service.getNetworkSummary(1);

      expect(result.totalContacts).toBe(2);
      expect(result.circleDistribution[ContactCircle.SUPPORT]).toBe(1);
      expect(result.circleDistribution[ContactCircle.DEVELOPMENT]).toBe(1);
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it('should return empty summary for no contacts', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);
      mockPrisma.meeting.findMany.mockResolvedValue([]);

      const result = await service.getNetworkSummary(1);

      expect(result.totalContacts).toBe(0);
      expect(result.healthScore).toBe(0);
      expect(result.recommendations).toEqual([]);
    });
  });

  describe('generateRecommendation', () => {
    it('should recommend ARCHIVE for dormant contacts with negative trust', async () => {
      const contact = {
        id: 1,
        userId: 1,
        contactId: '1',
        businessName: 'Dormant',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        trustInteractions: [
          { id: 1, delta: -10, createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) },
        ],
        meetings: [],
      };

      const result = (service as any).generateRecommendation(
        contact,
        ContactCircle.DEVELOPMENT,
        [],
      );

      expect(result.type).toBe(RecommendationType.ARCHIVE);
    });

    it('should recommend UNFREEZE for contacts inactive 3-6 months', async () => {
      const contact = {
        id: 1,
        userId: 1,
        contactId: '1',
        businessName: 'Dormant',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        trustInteractions: [
          { id: 1, delta: 10, createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
        ],
        meetings: [],
      };

      const result = (service as any).generateRecommendation(
        contact,
        ContactCircle.PRODUCTIVITY,
        [],
      );

      expect(result.type).toBe(RecommendationType.UNFREEZE);
    });
  });
});
