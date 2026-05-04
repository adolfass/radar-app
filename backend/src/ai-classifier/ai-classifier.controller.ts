import { Controller, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiClassifierService, ContactAnalysis, NetworkSummary } from './ai-classifier.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI Classifier')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiClassifierController {
  constructor(private aiClassifierService: AiClassifierService) {}

  @Get('classify/:contactId')
  @ApiOperation({ summary: 'Classify a single contact' })
  async classifyContact(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Request() req,
  ): Promise<ContactAnalysis> {
    return this.aiClassifierService.classifyContact(contactId, req.user.userId);
  }

  @Get('classify-all')
  @ApiOperation({ summary: 'Classify all contacts' })
  async classifyAll(@Request() req): Promise<ContactAnalysis[]> {
    return this.aiClassifierService.classifyAllContacts(req.user.userId);
  }

  @Get('network-summary')
  @ApiOperation({ summary: 'Get network health summary with recommendations' })
  async getNetworkSummary(@Request() req): Promise<NetworkSummary> {
    return this.aiClassifierService.getNetworkSummary(req.user.userId);
  }
}
