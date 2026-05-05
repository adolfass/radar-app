import { Module } from '@nestjs/common';
import { CryptoPayService } from './crypto-pay.service';
import { CryptoPayController } from './crypto-pay.controller';
import { TelegramStarsService } from './telegram-stars.service';
import { TelegramStarsController } from './telegram-stars.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [CryptoPayController, TelegramStarsController],
  providers: [CryptoPayService, TelegramStarsService],
  exports: [CryptoPayService, TelegramStarsService],
})
export class PaymentsModule {}
