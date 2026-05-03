import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BqgService } from './bqg.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBqgDto } from './dto/create-bqg.dto';
import { UpdateBqgDto } from './dto/update-bqg.dto';

@Controller('bqg')
@UseGuards(JwtAuthGuard)
export class BqgController {
  constructor(private bqgService: BqgService) {}

  @Get()
  async findAll(@Request() req) {
    return this.bqgService.findAll(req.user.userId);
  }

  @Get('current')
  async getCurrent(@Request() req) {
    return this.bqgService.getCurrent(req.user.userId);
  }

  @Get('analysis/missing-roles')
  async getMissingRolesAnalysis(@Request() req) {
    return this.bqgService.getMissingRolesAnalysis(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bqgService.findOne(id, req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() createDto: CreateBqgDto) {
    return this.bqgService.create(req.user.userId, createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBqgDto,
    @Request() req,
  ) {
    return this.bqgService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bqgService.remove(id, req.user.userId);
  }

  @Patch(':id/roles')
  async updateMissingRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { missingRoles: string },
    @Request() req,
  ) {
    return this.bqgService.updateMissingRoles(id, req.user.userId, body.missingRoles);
  }
}
