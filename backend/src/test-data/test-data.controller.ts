import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from '../contact/contact.service';
import { FakeDataGenerator } from './fake-data.generator';

@Controller('test-data')
@UseGuards(JwtAuthGuard)
export class TestDataController {
  constructor(
    private contactService: ContactService,
    private fakeGenerator: FakeDataGenerator,
  ) {}

  @Get('status')
  getStatus() {
    return {
      enabled: process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_DATA === 'true',
      environment: process.env.NODE_ENV,
    };
  }

  @Post('generate-contacts')
  @HttpCode(HttpStatus.CREATED)
  async generateTestContacts(
    @Body() body: { count?: number },
  ) {
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_TEST_DATA) {
      throw new ForbiddenException('Генерация тестовых данных отключена в production');
    }

    const count = body?.count ?? 99;
    if (count < 1 || count > 200) {
      throw new BadRequestException('Количество должно быть от 1 до 200');
    }

    const contacts = this.fakeGenerator.generate(1, count);
    const created = await this.contactService.createMany(contacts);

    return {
      success: true,
      created,
      message: 'Создано ' + created + ' тестовых контактов',
      warning: 'Данные помечены как тестовые (isTest: true) и могут быть удалены',
    };
  }

  @Post('cleanup-test-data')
  @HttpCode(HttpStatus.OK)
  async cleanupTestContacts() {
    const deleted = await this.contactService.deleteTestContacts(1);

    return {
      success: true,
      deleted,
      message: 'Удалено ' + deleted + ' тестовых контактов',
    };
  }
}
