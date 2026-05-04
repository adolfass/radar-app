import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingStatus } from './dto/create-meeting.dto';

describe('MeetingService', () => {
  let service: MeetingService;
  let prisma: PrismaService;

  const mockPrisma = {
    meeting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contact: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetingService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all meetings for a user', async () => {
      const meetings = [{ id: 1, userId: 1, status: 'planned' }];
      mockPrisma.meeting.findMany.mockResolvedValue(meetings);

      const result = await service.findAll(1);

      expect(result).toEqual(meetings);
      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    });

    it('should filter by status when provided', async () => {
      mockPrisma.meeting.findMany.mockResolvedValue([]);

      await service.findAll(1, 'completed');

      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith({
        where: { userId: 1, status: 'completed' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a meeting when found', async () => {
      const meeting = { id: 1, userId: 1 };
      mockPrisma.meeting.findUnique.mockResolvedValue(meeting);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(meeting);
    });

    it('should throw NotFoundException when meeting not found', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when userId mismatch', async () => {
      const meeting = { id: 1, userId: 2 };
      mockPrisma.meeting.findUnique.mockResolvedValue(meeting);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a meeting with planned status', async () => {
      const createDto = {
        contactId: 1,
        location: 'Cafe',
        scheduledAt: new Date(),
        anchors: '["Discuss project"]',
      };
      const created = { id: 1, ...createDto, status: 'planned', userId: 1 };
      mockPrisma.meeting.create.mockResolvedValue(created);

      const result = await service.create(1, createDto);

      expect(result).toEqual(created);
      expect(mockPrisma.meeting.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          contactId: 1,
          location: 'Cafe',
          scheduledAt: createDto.scheduledAt,
          anchors: '["Discuss project"]',
          status: 'planned',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a meeting', async () => {
      const meeting = { id: 1, userId: 1, contactId: '123' };
      const updateDto = { status: MeetingStatus.COMPLETED, notes: 'Great meeting' };
      const updated = { ...meeting, ...updateDto };

      mockPrisma.meeting.findUnique.mockResolvedValue(meeting);
      mockPrisma.meeting.update.mockResolvedValue(updated);
      mockPrisma.contact.update.mockResolvedValue({});

      const result = await service.update(1, 1, updateDto);

      expect(result).toEqual(updated);
    });

    it('should update contact lastInteraction when completed', async () => {
      const meeting = { id: 1, userId: 1, contactId: '123' };
      const updateDto = { status: MeetingStatus.COMPLETED };

      mockPrisma.meeting.findUnique.mockResolvedValue(meeting);
      mockPrisma.meeting.update.mockResolvedValue({ ...meeting, ...updateDto });
      mockPrisma.contact.update.mockResolvedValue({});

      await service.update(1, 1, updateDto);

      expect(mockPrisma.contact.update).toHaveBeenCalledWith({
        where: {
          userId_contactId: {
            userId: 1,
            contactId: '123',
          },
        },
        data: { lastInteraction: expect.any(Date) },
      });
    });

    it('should throw NotFoundException when meeting not found', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.update(1, 1, { status: MeetingStatus.COMPLETED })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a meeting', async () => {
      const meeting = { id: 1, userId: 1 };
      mockPrisma.meeting.findUnique.mockResolvedValue(meeting);
      mockPrisma.meeting.delete.mockResolvedValue({});

      const result = await service.remove(1, 1);

      expect(result).toEqual({ message: 'Meeting deleted' });
      expect(mockPrisma.meeting.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when meeting not found', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when userId mismatch', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming meetings', async () => {
      const meetings = [{ id: 1, status: 'planned' }];
      mockPrisma.meeting.findMany.mockResolvedValue(meetings);

      const result = await service.getUpcoming(1);

      expect(result).toEqual(meetings);
      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          status: { in: ['planned', 'in_progress'] },
          scheduledAt: { gte: expect.any(Date) },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      });
    });
  });

  describe('getRecent', () => {
    it('should return recent completed meetings', async () => {
      const meetings = [{ id: 1, status: 'completed' }];
      mockPrisma.meeting.findMany.mockResolvedValue(meetings);

      const result = await service.getRecent(1);

      expect(result).toEqual(meetings);
      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith({
        where: { userId: 1, status: 'completed' },
        orderBy: { actualAt: 'desc' },
        take: 10,
      });
    });
  });
});
