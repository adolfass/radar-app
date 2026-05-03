import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpgradeDto {
  @ApiPropertyOptional({ description: 'Number of months for premium subscription', default: 1 })
  months?: number;

  @ApiPropertyOptional({ description: 'Payment provider transaction ID' })
  paymentId?: string;

  @ApiPropertyOptional({ description: 'Payment provider receipt data' })
  receipt?: string;
}
