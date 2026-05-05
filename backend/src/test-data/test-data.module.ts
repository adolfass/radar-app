import { Module } from '@nestjs/common';
import { EncryptionModule } from '../encryption/encryption.module';
import { ContactModule } from '../contact/contact.module';
import { FakeDataGenerator } from './fake-data.generator';
import { TestDataController } from './test-data.controller';

@Module({
  imports: [EncryptionModule, ContactModule],
  controllers: [TestDataController],
  providers: [FakeDataGenerator],
  exports: [FakeDataGenerator],
})
export class TestDataModule {}
