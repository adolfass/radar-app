import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.referralService.getStats(req.user.userId);
  }

  @Get('logs')
  async getLogs(@Request() req) {
    return this.referralService.getLogs(req.user.userId);
  }

  @Get('link')
  async getReferralLink(@Request() req) {
    return this.referralService.generateReferralLink(req.user.userId);
  }
}
