import { Module } from '@nestjs/common';
import { CryptoPayService } from './crypto-pay.service';
import { CryptoPayController } from './crypto-pay.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [CryptoPayController],
  providers: [CryptoPayService],
  exports: [CryptoPayService],
})
export class CryptoPayModule {}
