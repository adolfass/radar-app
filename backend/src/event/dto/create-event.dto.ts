import { IsString, IsNotEmpty, IsISO8601, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Название события' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Описание события' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Место проведения' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Дата и время начала' })
  @IsISO8601()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Дата и время окончания' })
  @IsISO8601()
  @IsNotEmpty()
  endDate: string;
}
