import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('validate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async validate(@Body() authDto: AuthDto) {
    try {
      const user = await this.authService.validateUser(authDto);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Telegram data');
    }
  }
}
