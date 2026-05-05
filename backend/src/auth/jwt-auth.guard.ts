import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const expectedBotUsername =
        this.configService.get('TELEGRAM_BOT_USERNAME') || 'radar_strateg_bot';
      if (payload.botUsername && payload.botUsername !== expectedBotUsername) {
        throw new UnauthorizedException('Token from different bot');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          isOrganizer: true,
          balance: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request['user'] = {
        ...user,
        userId: user.id,
        telegramId: user.telegramId.toString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
