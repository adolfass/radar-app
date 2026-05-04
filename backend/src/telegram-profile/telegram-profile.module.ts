import { Module } from '@nestjs/common';
import { TelegramProfileService } from './telegram-profile.service';
import { ContactsTelegramController } from './contacts-telegram.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactsTelegramController],
  providers: [TelegramProfileService],
  exports: [TelegramProfileService],
})
export class TelegramProfileModule {}
