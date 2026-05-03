import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TrustInteractionType {
  YOU_HELPED = 'you_helped',
  THEY_HELPED = 'they_helped',
  MUTUAL = 'mutual',
}

export class LogTrustDto {
  @ApiProperty({ description: 'ID контакта', example: 1 })
  @IsInt()
  @IsNotEmpty()
  contactId: number;

  @ApiProperty({
    description: 'Тип взаимодействия',
    enum: TrustInteractionType,
    example: 'you_helped',
  })
  @IsEnum(TrustInteractionType)
  @IsNotEmpty()
  type: TrustInteractionType;

  @ApiPropertyOptional({ description: 'Описание взаимодействия' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Изменение баланса доверия (-100 до +100)',
    example: 10,
    minimum: -100,
    maximum: 100,
  })
  @IsInt()
  @Min(-100)
  @Max(100)
  balanceDelta: number;
}
