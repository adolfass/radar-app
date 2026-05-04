import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBqgDto } from './dto/create-bqg.dto';
import { UpdateBqgDto } from './dto/update-bqg.dto';

@Injectable()
export class BqgService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.bQG.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCurrent(userId: number) {
    const bqg = await this.prisma.bQG.findFirst({
      where: {
        userId,
        isActive: true,
        quarterEnd: { gte: new Date() },
      },
      orderBy: { quarterEnd: 'desc' },
    });

    if (!bqg) {
      throw new NotFoundException('No active BQG found for current quarter');
    }

    return bqg;
  }

  async findOne(id: number, userId: number) {
    const bqg = await this.prisma.bQG.findUnique({
      where: { id },
    });

    if (!bqg) {
      throw new NotFoundException('BQG not found');
    }

    if (bqg.userId !== userId) {
      throw new NotFoundException('BQG not found');
    }

    return bqg;
  }

  async create(userId: number, createDto: CreateBqgDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const quarterStart = new Date(createDto.quarterStart);
    const quarterEnd = new Date(createDto.quarterEnd);

    if (quarterEnd <= quarterStart) {
      throw new BadRequestException('quarterEnd must be after quarterStart');
    }

    if (createDto.missingRoles) {
      try {
        JSON.parse(createDto.missingRoles);
      } catch {
        throw new BadRequestException('missingRoles must be a valid JSON string');
      }
    }

    return this.prisma.bQG.create({
      data: {
        userId,
        goal: createDto.goal,
        missingRoles: createDto.missingRoles,
        quarterStart,
        quarterEnd,
        isActive: createDto.isActive ?? true,
      },
    });
  }

  async update(id: number, userId: number, updateDto: UpdateBqgDto) {
    const bqg = await this.prisma.bQG.findUnique({
      where: { id },
    });

    if (!bqg) {
      throw new NotFoundException('BQG not found');
    }

    if (bqg.userId !== userId) {
      throw new NotFoundException('BQG not found');
    }

    const data: any = {};

    if (updateDto.goal !== undefined) data.goal = updateDto.goal;
    if (updateDto.missingRoles !== undefined) {
      try {
        JSON.parse(updateDto.missingRoles);
      } catch {
        throw new BadRequestException('missingRoles must be a valid JSON string');
      }
      data.missingRoles = updateDto.missingRoles;
    }
    if (updateDto.quarterStart !== undefined) data.quarterStart = new Date(updateDto.quarterStart);
    if (updateDto.quarterEnd !== undefined) data.quarterEnd = new Date(updateDto.quarterEnd);
    if (updateDto.isActive !== undefined) data.isActive = updateDto.isActive;

    if (data.quarterStart && data.quarterEnd && data.quarterEnd <= data.quarterStart) {
      throw new BadRequestException('quarterEnd must be after quarterStart');
    }

    return this.prisma.bQG.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number) {
    const bqg = await this.prisma.bQG.findUnique({
      where: { id },
    });

    if (!bqg) {
      throw new NotFoundException('BQG not found');
    }

    if (bqg.userId !== userId) {
      throw new NotFoundException('BQG not found');
    }

    await this.prisma.bQG.delete({
      where: { id },
    });

    return { message: 'BQG deleted' };
  }

  async updateMissingRoles(id: number, userId: number, missingRoles: string) {
    const bqg = await this.prisma.bQG.findUnique({
      where: { id },
    });

    if (!bqg) {
      throw new NotFoundException('BQG not found');
    }

    if (bqg.userId !== userId) {
      throw new NotFoundException('BQG not found');
    }

    try {
      JSON.parse(missingRoles);
    } catch {
      throw new BadRequestException('missingRoles must be a valid JSON string');
    }

    return this.prisma.bQG.update({
      where: { id },
      data: { missingRoles },
    });
  }

  async getMissingRolesAnalysis(userId: number) {
    const bqgs = await this.prisma.bQG.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (bqgs.length === 0) {
      return { total: 0, roles: [], currentBqg: null };
    }

    const currentBqg = bqgs.find((b) => b.isActive) || bqgs[0];

    const rolesMap = new Map<string, number>();

    for (const bqg of bqgs) {
      if (bqg.missingRoles) {
        try {
          const roles: string[] = JSON.parse(bqg.missingRoles);
          for (const role of roles) {
            rolesMap.set(role, (rolesMap.get(role) || 0) + 1);
          }
        } catch {
          // skip invalid JSON
        }
      }
    }

    const roles = Array.from(rolesMap.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: bqgs.length,
      roles,
      currentBqg: currentBqg
        ? { id: currentBqg.id, goal: currentBqg.goal, missingRoles: currentBqg.missingRoles }
        : null,
    };
  }
}
