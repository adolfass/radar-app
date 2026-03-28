import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(authDto: AuthDto) {
    const { initData } = authDto;

    // Validate Telegram initData
    const isValid = this.validateTelegramData(initData);

    if (!isValid) {
      throw new Error('Invalid Telegram data');
    }

    // Parse user data from initData
    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    
    if (!userJson) {
      throw new Error('No user data in initData');
    }

    const userData = JSON.parse(userJson);
    const telegramId = BigInt(userData.id);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name,
          languageCode: userData.language_code,
          isPremium: userData.is_premium,
          photoUrl: userData.photo_url,
        },
      });
    }

    // Generate JWT token
    const token = await this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isOrganizer: user.isOrganizer,
        balance: user.balance,
      },
      token,
    };
  }

  private validateTelegramData(initData: string): boolean {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN is not configured');
      return false;
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    // Remove hash from params
    urlParams.delete('hash');

    // Sort params alphabetically
    const sortedParams = Array.from(urlParams.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create data check string
    const dataCheckString = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', dataCheckString)
      .update(sortedParams)
      .digest('hex');

    return calculatedHash === hash;
  }

  private async generateToken(userId: number): Promise<string> {
    return this.jwtService.signAsync({ sub: userId });
  }
}
