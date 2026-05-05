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
import { AdjustTrustSchema, LogTrustSchema } from '../common/validations/zod.schemas';
import { validateWithZod } from '../common/validations/zod.pipe';

@Controller('trust')
@UseGuards(JwtAuthGuard)
export class TrustController {
  constructor(private trustService: TrustService) {}

  @Post('adjust/:contactId')
  async adjustTrust(
    @Request() req,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() body: unknown,
  ) {
    const validated = validateWithZod(AdjustTrustSchema, body);
    return this.trustService.adjustTrust(
      req.user.userId,
      contactId,
      validated.delta,
      validated.reason,
    );
  }

  @Post('log')
  async logInteraction(@Request() req, @Body() body: unknown) {
    const validated = validateWithZod(LogTrustSchema, body);
    return this.trustService.logInteraction(
      req.user.userId,
      validated.contactId,
      validated.type || 'trust',
      validated.reason,
      validated.delta,
    );
  }

  @Get('balance/:contactId')
  async getTrustBalance(@Request() req, @Param('contactId', ParseIntPipe) contactId: number) {
    return this.trustService.getTrustBalance(req.user.userId, contactId);
  }

  @Get('history')
  async getTrustHistory(@Request() req, @Query('contactId', ParseIntPipe) contactId?: number) {
    return this.trustService.getTrustHistory(req.user.userId, contactId);
  }

  @Get('history/:contactId')
  async getContactTrustHistory(
    @Request() req,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    return this.trustService.getTrustHistory(req.user.userId, contactId);
  }

  @Get('top')
  async getTopTrustedContacts(@Request() req, @Query('limit', ParseIntPipe) limit?: number) {
    return this.trustService.getTopTrustedContacts(req.user.userId, limit);
  }
}
