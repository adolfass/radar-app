import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.meeting.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
    });

    if (!meeting || meeting.userId !== userId) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  async create(userId: number, createDto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        userId,
        contactId: createDto.contactId,
        location: createDto.location,
        scheduledAt: createDto.scheduledAt,
        anchors: createDto.anchors,
        status: 'planned',
      },
    });
  }

  async update(id: number, userId: number, updateDto: UpdateMeetingDto) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      throw new NotFoundException('Meeting not found');
    }

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: {
        status: updateDto.status,
        notes: updateDto.notes,
        outcomes: updateDto.outcomes,
        followUpDate: updateDto.followUpDate,
        actualAt: updateDto.actualAt,
      },
    });

    // If meeting completed, update contact's lastInteraction
    if (updateDto.status === 'completed') {
      await this.prisma.contact.update({
        where: {
          userId_contactId: {
            userId,
            contactId: meeting.contactId.toString(),
          },
        },
        data: {
          lastInteraction: new Date(),
        },
      });
    }

    return updated;
  }

  async remove(id: number, userId: number) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });

    if (!meeting || meeting.userId !== userId) {
      throw new NotFoundException('Meeting not found');
    }

    await this.prisma.meeting.delete({ where: { id } });
    return { message: 'Meeting deleted' };
  }

  async getUpcoming(userId: number) {
    return this.prisma.meeting.findMany({
      where: {
        userId,
        status: { in: ['planned', 'in_progress'] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });
  }

  async getRecent(userId: number) {
    return this.prisma.meeting.findMany({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: { actualAt: 'desc' },
      take: 10,
    });
  }
}
