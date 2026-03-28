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
} from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  async findAll(@Request() req) {
    return this.eventService.findAll(req.user.userId);
  }

  @Get('organized')
  async findOrganized(@Request() req) {
    return this.eventService.findOrganized(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventService.findOne(id, req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() createDto: CreateEventDto) {
    return this.eventService.create(req.user.userId, createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventService.remove(id, req.user.userId);
  }

  @Post(':id/register')
  async register(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventService.register(id, req.user.userId);
  }

  @Post(':id/unregister')
  async unregister(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventService.unregister(id, req.user.userId);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventService.getParticipants(id, req.user.userId);
  }
}
