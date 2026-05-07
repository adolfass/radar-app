import { Module } from '@nestjs/common';
import { NetworkGraphService } from './network-graph.service';
import { NetworkGraphController } from './network-graph.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  controllers: [NetworkGraphController],
  providers: [NetworkGraphService],
  exports: [NetworkGraphService],
})
export class NetworkGraphModule {}
