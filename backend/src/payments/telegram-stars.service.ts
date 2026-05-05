import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { ConfigService } from '@nestjs/config';

interface CreateStarsInvoiceParams {
  userId: number;
  plan: 'premium_monthly' | 'premium_yearly';
}

interface TelegramStarsWebhookPayload {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    successful_payment?: {
      telegram_payment_charge_id: string;
      provider_payment_charge_id: string;
      invoice_payload: string;
      total_amount: number;
      currency: string;
    };
  };
  pre_checkout_query?: {
    id: string;
    from: {
      id: number;
    };
    invoice_payload: string;
    total_amount: number;
    currency: string;
  };
}

@Injectable()
export class TelegramStarsService {
  private readonly logger = new Logger(TelegramStarsService.name);
  private readonly MONTHLY_PRICE_STARS = 99; // $0.99 in stars
  private readonly YEARLY_PRICE_STARS = 749; // $7.49 in stars

  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private configService: ConfigService,
  ) {}

  async createInvoice(
    params: CreateStarsInvoiceParams,
  ): Promise<{ invoiceLink: string; invoiceId: string }> {
    const { userId, plan } = params;
    const starsAmount =
      plan === 'premium_monthly' ? this.MONTHLY_PRICE_STARS : this.YEARLY_PRICE_STARS;

    const invoicePayload = JSON.stringify({ userId, plan });
    const invoiceId = `stars_${userId}_${Date.now()}`;

    await this.prisma.telegramStarsPayment.create({
      data: {
        userId,
        invoiceId,
        starsAmount,
        usdAmount: plan === 'premium_monthly' ? 0.99 : 7.49,
        plan,
        status: 'PENDING',
        payload: invoicePayload,
      },
    });

    const botUsername =
      this.configService.get('TELEGRAM_BOT_USERNAME') || 'radar_strateg_space_bot';
    const invoiceLink = `https://t.me/${botUsername}/premium?start=${invoiceId}`;

    this.logger.log(
      `Created Telegram Stars invoice ${invoiceId} for user ${userId}, plan: ${plan}, stars: ${starsAmount}`,
    );

    return { invoiceLink, invoiceId };
  }

  async handlePreCheckoutQuery(query: TelegramStarsWebhookPayload['pre_checkout_query']) {
    if (!query) return { ok: true };

    this.logger.log(`Received pre-checkout query: ${query.id}`);

    try {
      const payload = JSON.parse(query.invoice_payload);
      if (!payload.userId || !payload.plan) {
        throw new BadRequestException('Invalid invoice payload');
      }

      return { ok: true };
    } catch (error) {
      this.logger.error(`Pre-checkout validation failed: ${error.message}`);
      return { ok: false, error_message: 'Invalid invoice payload' };
    }
  }

  async handleSuccessfulPayment(message: TelegramStarsWebhookPayload['message']) {
    if (!message?.successful_payment) {
      return { ok: true };
    }

    const payment = message.successful_payment;
    const invoicePayload = payment.invoice_payload;
    const providerPaymentChargeId = payment.provider_payment_charge_id;
    const telegramPaymentChargeId = payment.telegram_payment_charge_id;

    this.logger.log(
      `Processing successful payment: ${telegramPaymentChargeId}, payload: ${invoicePayload}`,
    );

    try {
      const parsedPayload = JSON.parse(invoicePayload);
      const { userId, plan } = parsedPayload;

      const paymentRecord = await this.prisma.telegramStarsPayment.findUnique({
        where: { invoiceId: invoicePayload },
      });

      if (!paymentRecord) {
        this.logger.error(`Payment not found for invoice: ${invoicePayload}`);
        return { ok: false, error_message: 'Payment not found' };
      }

      if (paymentRecord.status === 'PAID') {
        this.logger.warn(`Payment already processed: ${paymentRecord.id}`);
        return { ok: true };
      }

      const subscription = await this.subscriptionService.getSubscription(userId);
      const months = plan === 'premium_yearly' ? 12 : 1;

      await this.prisma.telegramStarsPayment.update({
        where: { id: paymentRecord.id },
        data: {
          status: 'PAID',
          providerPaymentChatId: providerPaymentChargeId,
          confirmedAt: new Date(),
          subscriptionId: subscription.id,
        },
      });

      await this.subscriptionService.upgradeToPremium(userId, months);

      this.logger.log(
        `Telegram Stars payment confirmed for user ${userId}, plan: ${plan}, months: ${months}`,
      );

      await this.sendTelegramNotification(userId, plan, payment.total_amount);

      return { ok: true };
    } catch (error) {
      this.logger.error(`Payment processing failed: ${error.message}`);
      return { ok: false, error_message: 'Payment processing failed' };
    }
  }

  async getPaymentStatus(invoiceId: string) {
    const payment = await this.prisma.telegramStarsPayment.findUnique({
      where: { invoiceId },
    });

    if (!payment) {
      return { status: 'NOT_FOUND' };
    }

    return {
      status: payment.status,
      starsAmount: payment.starsAmount,
      plan: payment.plan,
      createdAt: payment.createdAt,
      confirmedAt: payment.confirmedAt,
    };
  }

  private async sendTelegramNotification(userId: number, plan: string, amount?: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.telegramId) return;

      const planText = plan === 'premium_monthly' ? 'Premium (месяц)' : 'Premium (год)';
      const message = `✅ *Оплата прошла!*\n\nВы подписаны на *${planText}*.\n\nСпасибо за поддержку! 🎉`;

      const { Telegraf } = await import('telegraf');
      const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
      if (!botToken) return;

      const bot = new Telegraf(botToken);
      await bot.telegram.sendMessage(user.telegramId.toString(), message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.warn(`Failed to send Telegram notification: ${error.message}`);
    }
  }
}
