import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Referral')
@Controller('referral')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get referral info and balance' })
  async getInfo(@Request() req) {
    return this.referralService.getInfo(req.user.userId);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem stars for premium subscription' })
  async redeem(
    @Request() req,
    @Body() body: { type: 'MONTH' | 'YEAR' },
  ) {
    if (!body.type || !['MONTH', 'YEAR'].includes(body.type)) {
      throw new Error('Invalid type. Use MONTH or YEAR');
    }
    return this.referralService.redeemStars(req.user.userId, body.type);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get referral history' })
  async getHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.referralService.getHistory(
      req.user.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
    );
  }
}