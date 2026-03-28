import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { BusinessCardService } from './business-card.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBusinessCardDto } from './dto/create-business-card.dto';
import { UpdateBusinessCardDto } from './dto/update-business-card.dto';

@Controller('business-cards')
export class BusinessCardController {
  constructor(private businessCardService: BusinessCardService) {}

  @Get('public/:contactId')
  async findByContactId(@Param('contactId') contactId: string) {
    return this.businessCardService.findByContactId(contactId);
  }

  @Get('qr/:contactId')
  async getQrCode(@Param('contactId') contactId: string) {
    return this.businessCardService.generateQrCode(contactId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    return this.businessCardService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.businessCardService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createDto: CreateBusinessCardDto) {
    const userCards = await this.businessCardService.findAll(req.user.userId);
    if (userCards.length >= 7) {
      throw new BadRequestException('Maximum 7 business cards allowed');
    }
    return this.businessCardService.create(req.user.userId, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBusinessCardDto,
    @Request() req,
  ) {
    return this.businessCardService.update(id, req.user.userId, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.businessCardService.remove(id, req.user.userId);
  }
}
