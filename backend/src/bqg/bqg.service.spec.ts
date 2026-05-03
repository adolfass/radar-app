import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BqgService } from './bqg.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BqgService', () => {
  let service: BqgService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    bQG: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contact: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BqgService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BqgService>(BqgService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all BQGs for a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.bQG.findMany.mockResolvedValue([{ id: 1, userId: 1, goal: 'Test' }]);

      const result = await service.findAll(1);

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException for missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findAll(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrent', () => {
    it('should return active BQG for current quarter', async () => {
      const bqg = { id: 1, userId: 1, isActive: true, goal: 'Q1 Goal' };
      mockPrisma.bQG.findFirst.mockResolvedValue(bqg);

      const result = await service.getCurrent(1);

      expect(result.goal).toBe('Q1 Goal');
    });

    it('should throw NotFoundException if no active BQG', async () => {
      mockPrisma.bQG.findFirst.mockResolvedValue(null);

      await expect(service.getCurrent(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a BQG when found', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue({ id: 1, userId: 1 });

      const result = await service.findOne(1, 1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException for wrong userId', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for missing BQG', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new BQG', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.bQG.create.mockResolvedValue({
        id: 1,
        userId: 1,
        goal: 'New Goal',
        quarterStart: new Date('2026-01-01'),
        quarterEnd: new Date('2026-03-31'),
      });

      const result = await service.create(1, {
        goal: 'New Goal',
        quarterStart: '2026-01-01',
        quarterEnd: '2026-03-31',
      });

      expect(result.goal).toBe('New Goal');
    });

    it('should throw BadRequestException if quarterEnd before quarterStart', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(1, {
        goal: 'Bad',
        quarterStart: '2026-03-31',
        quarterEnd: '2026-01-01',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create(1, {
        goal: 'Test',
        quarterStart: '2026-01-01',
        quarterEnd: '2026-03-31',
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a BQG', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.bQG.update.mockResolvedValue({ id: 1, goal: 'Updated' });

      const result = await service.update(1, 1, { goal: 'Updated' });

      expect(result.goal).toBe('Updated');
    });

    it('should throw NotFoundException for wrong userId', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.update(1, 1, { goal: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a BQG', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.bQG.delete.mockResolvedValue({});

      const result = await service.remove(1, 1);

      expect(result.message).toBe('BQG deleted');
    });

    it('should throw NotFoundException for wrong userId', async () => {
      mockPrisma.bQG.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMissingRolesAnalysis', () => {
    it('should return missing roles analysis', async () => {
      const bqgs = [
        { id: 1, userId: 1, isActive: true, goal: 'Q1', missingRoles: '["connector","bridge"]' },
        { id: 2, userId: 1, isActive: false, goal: 'Q2', missingRoles: '["connector"]' },
      ];
      mockPrisma.bQG.findMany.mockResolvedValue(bqgs);

      const result = await service.getMissingRolesAnalysis(1);

      expect(result.total).toBe(2);
      expect(result.roles).toHaveLength(2);
      expect(result.roles[0].role).toBe('connector');
      expect(result.roles[0].count).toBe(2);
      expect(result.currentBqg).not.toBeNull();
      expect(result.currentBqg!.goal).toBe('Q1');
    });

    it('should return empty analysis for no BQGs', async () => {
      mockPrisma.bQG.findMany.mockResolvedValue([]);

      const result = await service.getMissingRolesAnalysis(1);

      expect(result.total).toBe(0);
      expect(result.roles).toEqual([]);
      expect(result.currentBqg).toBeNull();
    });
  });
});
