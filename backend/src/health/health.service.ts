import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<Record<string, any>> {
    const checks: Record<string, any> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {},
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.services.postgres = 'connected';
    } catch {
      checks.services.postgres = 'disconnected';
      checks.status = 'degraded';
    }

    return checks;
  }
}
