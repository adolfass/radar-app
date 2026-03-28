import {
  Controller,
  Get,
  Post,
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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactService.remove(id, req.user.userId);
  }

  @Get('export/:id')
  async exportVCard(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactService.exportVCard(id, req.user.userId);
  }
}
