import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { TelegramProfileService } from '../telegram-profile/telegram-profile.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private telegramProfileService: TelegramProfileService,
  ) {}

  async validateUser(authDto: AuthDto) {
    const { initData } = authDto;
    console.log(
      'Received initData:',
      initData ? 'present (' + initData.length + ' chars)' : 'empty',
    );

    // Validate Telegram initData
    const isValid = this.validateTelegramData(initData);
    console.log('InitData valid:', isValid);

    if (!isValid) {
      console.log('Invalid initData content:', initData?.substring(0, 100));
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
    console.log('Telegram user ID:', telegramId);

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
      console.log('Created new user:', user.id);
    } else if (!user.photoUrl) {
      try {
        const profile = await this.telegramProfileService.lookupById(Number(telegramId));
        if (profile?.photoUrl) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { photoUrl: profile.photoUrl },
          });
          this.logger.log(`Updated photoUrl for user ${user.id}`);
        }
      } catch (error) {
        this.logger.warn('Failed to fetch user photo:', error);
      }
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
        photoUrl: user.photoUrl,
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
      console.log('No hash in initData');
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
    const dataCheckString = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', dataCheckString)
      .update(sortedParams)
      .digest('hex');

    const isValid = calculatedHash === hash;
    console.log('Hash validation:', isValid ? 'passed' : 'failed');
    return isValid;
  }

  private async generateToken(userId: number): Promise<string> {
    return this.jwtService.signAsync({ userId });
  }
}
