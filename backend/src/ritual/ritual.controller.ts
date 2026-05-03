import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { RitualService } from './ritual.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompleteRitualDto } from './dto/complete-ritual.dto';

@Controller('ritual')
@UseGuards(JwtAuthGuard)
export class RitualController {
  constructor(private ritualService: RitualService) {}

  @Post('start')
  async start(@Request() req) {
    return this.ritualService.startRitual(req.user.userId);
  }

  @Post(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() completeDto: CompleteRitualDto,
  ) {
    return this.ritualService.completeRitual(
      req.user.userId,
      id,
      completeDto as Record<string, unknown>,
    );
  }

  @Get('active')
  async getActive(@Request() req) {
    return this.ritualService.getActiveRitual(req.user.userId);
  }

  @Get('history')
  async getHistory(@Request() req) {
    return this.ritualService.getRitualHistory(req.user.userId);
  }

  @Get('health')
  async getHealth(@Request() req) {
    const history = await this.ritualService.getNetworkHealthHistory(req.user.userId);
    return history[0] || null;
  }

  @Get('health/history')
  async getHealthHistory(@Request() req) {
    return this.ritualService.getNetworkHealthHistory(req.user.userId);
  }
}
