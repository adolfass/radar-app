import { Module } from '@nestjs/common';
import { BqgController } from './bqg.controller';
import { BqgService } from './bqg.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BqgController],
  providers: [BqgService],
  exports: [BqgService],
})
export class BqgModule {}
