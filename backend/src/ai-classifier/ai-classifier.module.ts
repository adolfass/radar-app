import { Module } from '@nestjs/common';
import { AiClassifierService } from './ai-classifier.service';
import { AiClassifierController } from './ai-classifier.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiClassifierController],
  providers: [AiClassifierService],
  exports: [AiClassifierService],
})
export class AiClassifierModule {}
