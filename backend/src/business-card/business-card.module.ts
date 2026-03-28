import { Module } from '@nestjs/common';
import { BusinessCardController } from './business-card.controller';
import { BusinessCardService } from './business-card.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [BusinessCardController],
  providers: [BusinessCardService],
  exports: [BusinessCardService],
})
export class BusinessCardModule {}
