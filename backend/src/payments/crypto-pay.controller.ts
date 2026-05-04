import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  UseGuards,
  RawBodyRequest,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CryptoPayService } from './crypto-pay.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments/crypto')
export class CryptoPayController {
  constructor(private cryptoPayService: CryptoPayService) {}

  @Post('create-invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Crypto Pay invoice for premium subscription' })
  async createInvoice(
    @Req() req: any,
    @Body() body: { plan: 'premium_monthly' | 'premium_yearly' },
  ) {
    if (!body.plan || !['premium_monthly', 'premium_yearly'].includes(body.plan)) {
      throw new BadRequestException('Invalid plan. Must be premium_monthly or premium_yearly');
    }

    return this.cryptoPayService.createInvoice({
      userId: req.user.userId,
      plan: body.plan,
    });
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Crypto Pay webhook notifications' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('crypto-pay-api-signature') signature: string,
  ) {
    const rawBody = req.rawBody?.toString() || '';
    
    if (!rawBody) {
      throw new BadRequestException('Empty request body');
    }

    const success = await this.cryptoPayService.handleWebhook(rawBody, signature);

    if (!success) {
      throw new BadRequestException('Webhook processing failed');
    }

    return { ok: true };
  }

  @Get('status/:invoiceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check payment status' })
  async getPaymentStatus(@Param('invoiceId') invoiceId: string) {
    return this.cryptoPayService.getPaymentStatus(invoiceId);
  }
}
