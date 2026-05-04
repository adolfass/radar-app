import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TrustService } from './trust.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TrustService', () => {
  let service: TrustService;

  const mockPrisma = {
    contact: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    trustInteraction: {
      create: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrustService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TrustService>(TrustService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logInteraction', () => {
    it('should create a trust interaction', async () => {
      const contact = { id: 1, userId: 1, businessName: 'Test' };
      mockPrisma.contact.findUnique.mockResolvedValue(contact);
      mockPrisma.trustInteraction.create.mockResolvedValue({
        id: 1,
        userId: 1,
        contactId: 1,
        type: 'you_helped',
        balanceDelta: 10,
      });

      const result = await service.logInteraction(1, 1, 'you_helped', 'Helped with project', 10);

      expect(result.balanceDelta).toBe(10);
      expect(mockPrisma.trustInteraction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          contactId: 1,
          type: 'you_helped',
          description: 'Helped with project',
          balanceDelta: 10,
        },
        include: { contact: { select: { id: true, businessName: true, circle: true } } },
      });
    });

    it('should throw NotFoundException for missing contact', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.logInteraction(1, 999, 'you_helped', undefined, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for wrong userId', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.logInteraction(1, 1, 'you_helped', undefined, 10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTrustBalance', () => {
    it('should return trust balance', async () => {
      const contact = { id: 1, userId: 1, businessName: 'Test', contactId: '1' };
      mockPrisma.contact.findUnique.mockResolvedValue(contact);
      mockPrisma.trustInteraction.aggregate.mockResolvedValue({ _sum: { balanceDelta: 25 } });

      const result = await service.getTrustBalance(1, 1);

      expect(result.balance).toBe(25);
      expect(result.contactId).toBe(1);
    });

    it('should return 0 for no interactions', async () => {
      const contact = { id: 1, userId: 1, businessName: 'Test', contactId: '1' };
      mockPrisma.contact.findUnique.mockResolvedValue(contact);
      mockPrisma.trustInteraction.aggregate.mockResolvedValue({ _sum: { balanceDelta: null } });

      const result = await service.getTrustBalance(1, 1);

      expect(result.balance).toBe(0);
    });
  });

  describe('getTrustHistory', () => {
    it('should return all interactions for user', async () => {
      const interactions = [{ id: 1, userId: 1, balanceDelta: 10 }];
      mockPrisma.trustInteraction.findMany.mockResolvedValue(interactions);

      const result = await service.getTrustHistory(1);

      expect(result).toEqual(interactions);
    });

    it('should filter by contactId when provided', async () => {
      const contact = { id: 1, userId: 1 };
      mockPrisma.contact.findUnique.mockResolvedValue(contact);
      mockPrisma.trustInteraction.findMany.mockResolvedValue([]);

      await service.getTrustHistory(1, 1);

      expect(mockPrisma.trustInteraction.findMany).toHaveBeenCalledWith({
        where: { userId: 1, contactId: 1 },
        include: { contact: { select: { id: true, businessName: true, circle: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getTopTrustedContacts', () => {
    it('should return top trusted contacts', async () => {
      mockPrisma.trustInteraction.groupBy.mockResolvedValue([
        { contactId: 1, _sum: { balanceDelta: 50 } },
        { contactId: 2, _sum: { balanceDelta: 30 } },
      ]);
      mockPrisma.contact.findMany.mockResolvedValue([
        { id: 1, businessName: 'Contact A', contactId: '1', circle: 'support' },
        { id: 2, businessName: 'Contact B', contactId: '2', circle: 'productivity' },
      ]);

      const result = await service.getTopTrustedContacts(1);

      expect(result).toHaveLength(2);
      expect(result[0].balance).toBe(50);
      expect(result[0].contactName).toBe('Contact A');
    });

    it('should return empty array for no interactions', async () => {
      mockPrisma.trustInteraction.groupBy.mockResolvedValue([]);

      const result = await service.getTopTrustedContacts(1);

      expect(result).toEqual([]);
    });
  });
});
