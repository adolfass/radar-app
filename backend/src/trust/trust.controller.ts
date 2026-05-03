import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TrustService } from './trust.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LogTrustDto } from './dto/log-trust.dto';

@Controller('trust')
@UseGuards(JwtAuthGuard)
export class TrustController {
  constructor(private trustService: TrustService) {}

  @Post('log')
  async logInteraction(
    @Request() req,
    @Body() logTrustDto: LogTrustDto,
  ) {
    return this.trustService.logInteraction(
      req.user.userId,
      logTrustDto.contactId,
      logTrustDto.type,
      logTrustDto.description,
      logTrustDto.balanceDelta,
    );
  }

  @Get('balance/:contactId')
  async getTrustBalance(
    @Request() req,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    return this.trustService.getTrustBalance(req.user.userId, contactId);
  }

  @Get('history')
  async getTrustHistory(
    @Request() req,
    @Query('contactId', ParseIntPipe) contactId?: number,
  ) {
    return this.trustService.getTrustHistory(req.user.userId, contactId);
  }

  @Get('top')
  async getTopTrustedContacts(
    @Request() req,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.trustService.getTopTrustedContacts(req.user.userId, limit);
  }
}
