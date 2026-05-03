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
  Query,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingController {
  constructor(private meetingService: MeetingService) {}

  @Get()
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.meetingService.findAll(req.user.userId, status);
  }

  @Get('upcoming')
  async getUpcoming(@Request() req) {
    return this.meetingService.getUpcoming(req.user.userId);
  }

  @Get('recent')
  async getRecent(@Request() req) {
    return this.meetingService.getRecent(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.meetingService.findOne(id, req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() createDto: CreateMeetingDto) {
    return this.meetingService.create(req.user.userId, createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateDto: UpdateMeetingDto,
  ) {
    return this.meetingService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.meetingService.remove(id, req.user.userId);
  }
}
