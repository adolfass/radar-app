import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TelegramProfileService } from './telegram-profile.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  LookupUsernameDto,
  MatchPhoneDto,
  TelegramProfileResponseDto,
  PhoneMatchResponseDto,
} from './dto/telegram-profile.dto';
import { Request } from 'express';

@ApiTags('Contacts - Telegram')
@Controller('contacts/telegram')
export class ContactsTelegramController {
  private readonly logger = new Logger(ContactsTelegramController.name);

  constructor(
    private profileService: TelegramProfileService,
    private prisma: PrismaService,
  ) {}

  @Post('lookup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Lookup Telegram user by @username' })
  async lookup(
    @Body() dto: LookupUsernameDto,
    @Req() req: Request,
  ): Promise<TelegramProfileResponseDto> {
    const userId = (req as any).user?.userId;
    const profile = await this.profileService.lookupByUsername(dto.username);

    if (!profile) {
      return {
        found: false,
        suggestion:
          'Пользователь не найден или профиль приватный. Попросите контакт поделиться визиткой.',
      };
    }

    const existingContact = await this.prisma.contact.findFirst({
      where: {
        userId,
        contactId: profile.telegramId.toString(),
      },
    });

    return {
      found: true,
      alreadyAdded: !!existingContact,
      profile,
    };
  }

  @Post('match-by-phone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Find RADAR users by phone hash (opt-in)' })
  async matchByPhone(@Body() dto: MatchPhoneDto): Promise<PhoneMatchResponseDto> {
    const matches = await this.prisma.user.findMany({
      where: {
        phoneHash: dto.phoneHash,
        allowContactMatching: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
      },
    });

    return {
      matches: matches.map((m) => ({
        userId: m.id,
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        username: m.username || undefined,
        avatarUrl: m.photoUrl || undefined,
      })),
    };
  }
}
