import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TelegramStarsService } from './telegram-stars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments/stars')
export class TelegramStarsController {
  constructor(private telegramStarsService: TelegramStarsService) {}

  @Post('create-invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Telegram Stars invoice for premium subscription' })
  async createInvoice(
    @Req() req: any,
    @Body() body: { plan: 'premium_monthly' | 'premium_yearly' },
  ) {
    if (!body.plan || !['premium_monthly', 'premium_yearly'].includes(body.plan)) {
      throw new BadRequestException('Invalid plan. Must be premium_monthly or premium_yearly');
    }

    return this.telegramStarsService.createInvoice({
      userId: req.user.userId,
      plan: body.plan,
    });
  }

  @Post('pre-checkout')
  @ApiOperation({ summary: 'Handle Telegram pre-checkout query' })
  async handlePreCheckout(@Body() body: any) {
    return this.telegramStarsService.handlePreCheckoutQuery(body.pre_checkout_query);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Telegram successful payment webhook' })
  async handleWebhook(@Body() body: any) {
    return this.telegramStarsService.handleSuccessfulPayment(body);
  }

  @Get('status/:invoiceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check Telegram Stars payment status' })
  async getPaymentStatus(@Param('invoiceId') invoiceId: string) {
    return this.telegramStarsService.getPaymentStatus(invoiceId);
  }
}
