import { Controller, Post, Body, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: any;
}

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

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Req() req: RequestWithUser) {
    return { user: req.user };
  }
}
