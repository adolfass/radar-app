import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user is organizer, show all events. Otherwise, show only active events
    const where: any = user.isOrganizer ? {} : { isActive: true };

    return this.prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        registrations: {
          where: { userId },
          select: { status: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOrganized(userId: number) {
    return this.prisma.event.findMany({
      where: { organizerId: userId },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                telegramId: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: number, _userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(userId: number, createDto: CreateEventDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isOrganizer) {
      throw new ForbiddenException('Only organizers can create events');
    }

    return this.prisma.event.create({
      data: {
        organizerId: userId,
        title: createDto.title,
        description: createDto.description,
        location: createDto.location,
        startDate: createDto.startDate,
        endDate: createDto.endDate,
        isActive: true,
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: number, userId: number, updateDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can update the event');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        title: updateDto.title,
        description: updateDto.description,
        location: updateDto.location,
        startDate: updateDto.startDate,
        endDate: updateDto.endDate,
        isActive: updateDto.isActive,
      },
    });
  }

  async remove(id: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can delete the event');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted' };
  }

  async register(eventId: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new BadRequestException('Event is no longer active');
    }

    try {
      return await this.prisma.eventRegistration.create({
        data: {
          eventId,
          userId,
          status: 'registered',
        },
        include: {
          event: {
            include: {
              organizer: {
                select: {
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Already registered for this event');
      }
      throw error;
    }
  }

  async unregister(eventId: number, userId: number) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Not registered for this event');
    }

    await this.prisma.eventRegistration.delete({
      where: { id: registration.id },
    });

    return { message: 'Successfully unregistered from the event' };
  }

  async getParticipants(eventId: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
                businessCards: {
                  where: { isActive: true },
                  select: {
                    contactId: true,
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only organizer can see all participants
    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can view participants');
    }

    return event.registrations;
  }
}
