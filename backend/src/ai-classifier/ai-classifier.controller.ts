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

  @Get('analyze/:contactId')
  @ApiOperation({ summary: 'AI-powered contact analysis using LLM' })
  async analyzeWithAI(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Request() req,
  ): Promise<{ analysis: string }> {
    const analysis = await this.aiClassifierService.analyzeContactWithAI(
      contactId,
      req.user.userId,
    );
    return { analysis };
  }

  @Get('network-insight')
  @ApiOperation({ summary: 'Get AI insight on entire network' })
  async networkInsight(@Request() req): Promise<{ insight: string }> {
    const summary = await this.aiClassifierService.getNetworkSummary(req.user.userId);

    const prompt = `Проанализируй состояние сети контактов и дай рекомендации:

Статистика:
- Всего контактов: ${summary.totalContacts}
- Круг поддержки: ${summary.circleDistribution.support}
- Круг продуктивности: ${summary.circleDistribution.productivity}
- Круг развития: ${summary.circleDistribution.development}
- Оценка здоровья сети: ${summary.healthScore}/100

Отсутствующие роли: ${summary.missingRoles.join(', ') || 'все роли представлены'}

Топ рекомендации:
${summary.recommendations
  .slice(0, 3)
  .map((r, i) => `${i + 1}. ${r.action}`)
  .join('\n')}

Дай краткий анализ (3-4 предложения) и 2-3 конкретные рекомендации на русском языке.`;

    const insight = await this.aiClassifierService.queryLLM(prompt);
    return { insight };
  }
}
