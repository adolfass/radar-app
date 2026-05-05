import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
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
import { NetworkGraphModule } from './network-graph/network-graph.module';
import { HealthModule } from './health/health.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { PaymentsModule } from './payments/payments.module';
import { TelegramProfileModule } from './telegram-profile/telegram-profile.module';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
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
    NetworkGraphModule,
    HealthModule,
    Neo4jModule,
    PaymentsModule,
    TelegramProfileModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes('payments/crypto/webhook');
  }
}
