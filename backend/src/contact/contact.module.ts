import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReferralModule } from '../referral/referral.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [PrismaModule, ReferralModule, EncryptionModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
