import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('validate')
  async validate(@Body() authDto: AuthDto) {
    try {
      const user = await this.authService.validateUser(authDto);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Telegram data');
    }
  }
}
