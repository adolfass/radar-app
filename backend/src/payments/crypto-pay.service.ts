import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import * as crypto from 'crypto';

interface CreateInvoiceParams {
  userId: number;
  plan: 'premium_monthly' | 'premium_yearly';
}

interface CryptoPayInvoice {
  invoice_id: string;
  status: string;
  amount: string;
  asset: string;
  currency: string;
  pay_url: string;
  expires_at: string;
}

interface WebhookPayload {
  update_id: number;
  update_type: string;
  payload: string;
  invoice: {
    invoice_id: string;
    status: string;
    asset: string;
    amount: string;
    currency: string;
    paid_usd_rate?: string;
  };
}

@Injectable()
export class CryptoPayService {
  private readonly logger = new Logger(CryptoPayService.name);
  private readonly apiUrl = 'https://pay.crypt.bot/api';
  private readonly apiToken: string;
  private readonly testnet: boolean;

  private readonly PLAN_PRICES_USDT: Record<string, number> = {
    premium_monthly: 0.65,
    premium_yearly: 5.4,
  };

  private readonly PLAN_LABELS: Record<string, string> = {
    premium_monthly: 'RADAR Premium — 1 month',
    premium_yearly: 'RADAR Premium — 1 year',
  };

  private readonly PLAN_DAYS: Record<string, number> = {
    premium_monthly: 30,
    premium_yearly: 365,
  };

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {
    this.apiToken = this.configService.get('CRYPTOPAY_API_TOKEN', '');
    this.testnet = this.configService.get('CRYPTOPAY_TESTNET', 'false') === 'true';
  }

  async createInvoice(params: CreateInvoiceParams) {
    const { userId, plan } = params;
    const amount = this.PLAN_PRICES_USDT[plan];
    const description = this.PLAN_LABELS[plan];

    if (!amount) {
      throw new BadRequestException('Invalid plan');
    }

    const payload = JSON.stringify({ user_id: userId, plan });
    const siteUrl = this.configService.get('SITE_URL', 'https://radar.strateg.space');

    const existingPayment = await this.prisma.cryptoPayment.findFirst({
      where: {
        userId,
        status: 'PENDING',
        payload: { contains: plan },
      },
    });

    if (existingPayment) {
      const expiresAt = new Date(existingPayment.createdAt.getTime() + 30 * 60 * 1000);
      if (expiresAt > new Date()) {
        this.logger.log(
          `Returning existing pending invoice ${existingPayment.invoiceId} for user ${userId}`,
        );
        return {
          invoice_id: existingPayment.invoiceId,
          pay_url: `https://t.me/CryptoBot?start=pay-${existingPayment.invoiceId}`,
          amount_usdt: existingPayment.amountUsdt.toString(),
          expires_at: expiresAt.toISOString(),
        };
      }
    }

    const invoiceData = await this.callCryptoPayAPI('createInvoice', {
      asset: 'USDT',
      amount: amount.toString(),
      currency: 'USD',
      description,
      paid_btn_name: 'callback',
      paid_btn_url: `${siteUrl}/api/payments/crypto/webhook`,
      payload,
      allow_comments: false,
      allow_anonymous: false,
    });

    if (!invoiceData?.result) {
      throw new BadRequestException('Failed to create invoice');
    }

    const invoice: CryptoPayInvoice = invoiceData.result;

    await this.prisma.cryptoPayment.create({
      data: {
        userId,
        invoiceId: invoice.invoice_id,
        amountUsd: parseFloat(invoice.amount) || amount,
        amountUsdt: amount,
        asset: 'USDT',
        status: 'PENDING',
        payload,
      },
    });

    this.logger.log(
      `Created invoice ${invoice.invoice_id} for user ${userId}, plan: ${plan}, amount: ${amount} USDT`,
    );

    return {
      invoice_id: invoice.invoice_id,
      pay_url: invoice.pay_url || `https://t.me/CryptoBot?start=pay-${invoice.invoice_id}`,
      amount_usdt: amount.toString(),
      expires_at: invoice.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async handleWebhook(body: string, signature: string): Promise<boolean> {
    if (!this.verifySignature(body, signature)) {
      this.logger.warn('Invalid webhook signature');
      return false;
    }

    const payload: WebhookPayload = JSON.parse(body);

    if (payload.update_type !== 'invoice_paid') {
      this.logger.log(`Ignoring webhook type: ${payload.update_type}`);
      return true;
    }

    const { invoice } = payload;
    const payment = await this.prisma.cryptoPayment.findUnique({
      where: { invoiceId: invoice.invoice_id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for invoice ${invoice.invoice_id}`);
      return false;
    }

    if (payment.status === 'PAID') {
      this.logger.log(`Invoice ${invoice.invoice_id} already processed`);
      return true;
    }

    if (invoice.status !== 'paid') {
      this.logger.log(`Invoice ${invoice.invoice_id} status: ${invoice.status}`);
      return true;
    }

    const expectedAmount = payment.amountUsdt;
    const receivedAmount = parseFloat(invoice.amount);
    if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
      this.logger.warn(
        `Amount mismatch for invoice ${invoice.invoice_id}: expected ${expectedAmount}, got ${receivedAmount}`,
      );
      await this.prisma.cryptoPayment.update({
        where: { invoiceId: invoice.invoice_id },
        data: { status: 'FAILED' },
      });
      return false;
    }

    const payloadData = JSON.parse(payment.payload);
    const plan = payloadData.plan;
    const days = this.PLAN_DAYS[plan] || 30;

    await this.prisma.cryptoPayment.update({
      where: { invoiceId: invoice.invoice_id },
      data: {
        status: 'PAID',
        confirmedAt: new Date(),
      },
    });

    await this.subscriptionService.upgradeToPremium(payment.userId, Math.ceil(days / 30));

    this.logger.log(`Payment confirmed for user ${payment.userId}, plan: ${plan}, days: ${days}`);

    await this.sendTelegramNotification(payment.userId, plan);

    return true;
  }

  async getPaymentStatus(invoiceId: string) {
    const payment = await this.prisma.cryptoPayment.findUnique({
      where: { invoiceId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      invoice_id: payment.invoiceId,
      status: payment.status,
      amount_usdt: payment.amountUsdt,
      confirmed_at: payment.confirmedAt,
    };
  }

  private verifySignature(body: string, signature: string): boolean {
    if (!this.apiToken) {
      this.logger.error('CRYPTOPAY_API_TOKEN not configured');
      return false;
    }

    const expectedSignature = crypto.createHmac('sha256', this.apiToken).update(body).digest('hex');

    const isValid = expectedSignature === signature;
    if (!isValid) {
      this.logger.warn(`Signature mismatch. Expected: ${expectedSignature}, Got: ${signature}`);
    }
    return isValid;
  }

  private async callCryptoPayAPI(method: string, params: Record<string, any>) {
    const url = `${this.apiUrl}/${method}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Crypto-Pay-API-Token': this.apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      this.logger.error(`Crypto Pay API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json();
  }

  private async sendTelegramNotification(userId: number, plan: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
      if (!botToken) return;

      const planLabel = plan === 'premium_yearly' ? '1 год' : '1 месяц';
      const message = `✅ *RADAR Premium активирован!*\n\nПлан: ${planLabel}\nСпасибо за покупку!`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegramId.toString(),
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      this.logger.error('Failed to send Telegram notification:', error);
    }
  }
}
