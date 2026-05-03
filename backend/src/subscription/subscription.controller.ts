import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpgradeDto } from './dto/upgrade.dto';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  async getSubscription(@Request() req) {
    return this.subscriptionService.getSubscription(req.user.userId);
  }

  @Post('trial')
  async activateTrial(
    @Request() req,
    @Query('days') days?: number,
  ) {
    return this.subscriptionService.activateTrial(
      req.user.userId,
      days ? parseInt(days.toString(), 10) : undefined,
    );
  }

  @Post('upgrade')
  async upgradeToPremium(
    @Request() req,
    @Body() upgradeDto: UpgradeDto,
  ) {
    return this.subscriptionService.upgradeToPremium(
      req.user.userId,
      upgradeDto.months,
    );
  }

  @Get('limit')
  async checkContactLimit(
    @Request() req,
    @Query('count') count: string,
  ) {
    const currentCount = parseInt(count, 10) || 0;
    return this.subscriptionService.checkContactLimit(
      req.user.userId,
      currentCount,
    );
  }
}
