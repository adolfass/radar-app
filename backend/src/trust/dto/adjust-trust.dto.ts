import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustTrustDto {
  @ApiProperty({ description: 'Amount to adjust trust by (-100 to +100)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  @IsString()
  @IsOptional()
  reason?: string;
}
