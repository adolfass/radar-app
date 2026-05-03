import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BusinessCardModule } from './business-card/business-card.module';
import { ContactModule } from './contact/contact.module';
import { ReferralModule } from './referral/referral.module';
import { EventModule } from './event/event.module';
import { TelegramModule } from './telegram/telegram.module';
import { BqgModule } from './bqg/bqg.module';
import { TrustModule } from './trust/trust.module';
import { RitualModule } from './ritual/ritual.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MeetingModule } from './meeting/meeting.module';
import { EncryptionModule } from './encryption/encryption.module';
import { AiClassifierModule } from './ai-classifier/ai-classifier.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    AuthModule,
    UserModule,
    BusinessCardModule,
    ContactModule,
    ReferralModule,
    EventModule,
    TelegramModule,
    BqgModule,
    TrustModule,
    RitualModule,
    SubscriptionModule,
    MeetingModule,
    EncryptionModule,
    AiClassifierModule,
  ],
})
export class AppModule {}
