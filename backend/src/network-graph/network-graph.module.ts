import { Module } from '@nestjs/common';
import { NetworkGraphService } from './network-graph.service';
import { NetworkGraphController } from './network-graph.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NetworkGraphController],
  providers: [NetworkGraphService],
  exports: [NetworkGraphService],
})
export class NetworkGraphModule {}
