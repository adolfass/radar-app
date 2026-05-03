import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBqgDto {
  @ApiProperty({ description: 'Цель боевой группировки' })
  @IsString()
  @IsNotEmpty()
  goal: string;

  @ApiPropertyOptional({ description: 'Отсутствующие роли (JSON array)' })
  @IsString()
  @IsOptional()
  missingRoles?: string;

  @ApiProperty({ description: 'Начало квартала' })
  @IsISO8601()
  @IsNotEmpty()
  quarterStart: string;

  @ApiProperty({ description: 'Конец квартала' })
  @IsISO8601()
  @IsNotEmpty()
  quarterEnd: string;

  @ApiPropertyOptional({ description: 'Активна ли группировка', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
