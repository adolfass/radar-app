import { Module } from '@nestjs/common';
import { RitualController } from './ritual.controller';
import { RitualService } from './ritual.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RitualController],
  providers: [RitualService],
  exports: [RitualService],
})
export class RitualModule {}
