import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddContactByRefDto } from './dto/add-contact-by-ref.dto';
import { CreateContactSchema, UpdateContactSchema } from '../common/validations/zod.schemas';
import { validateWithZod } from '../common/validations/zod.pipe';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  async findAll(@Request() req, @Query('search') search?: string) {
    return this.contactService.findAll(req.user.userId, search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactService.findOne(id, req.user.userId);
  }

  @Post('add-by-ref')
  async addByRef(@Request() req, @Body() addDto: AddContactByRefDto) {
    return this.contactService.addByRef(req.user.userId, addDto);
  }

  @Patch(':id/private-meta')
  async updatePrivateMeta(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { privateMeta: Record<string, unknown> },
  ) {
    return this.contactService.updatePrivateMeta(id, req.user.userId, body.privateMeta);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactService.remove(id, req.user.userId);
  }

  @Post('validate')
  async validateContact(@Body() body: unknown) {
    const validated = validateWithZod(CreateContactSchema, body);
    return { valid: true, data: validated, message: 'Validation passed' };
  }

  @Patch(':id/validate')
  async validateUpdate(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    const validated = validateWithZod(UpdateContactSchema, body);
    return { valid: true, data: validated, message: 'Validation passed' };
  }
}
