import { IsOptional, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteRitualDto {
  @ApiPropertyOptional({ description: 'Количество просмотренных контактов' })
  @IsOptional()
  @IsNumber()
  contactsReviewed?: number;

  @ApiPropertyOptional({ description: 'Количество архивированных контактов' })
  @IsOptional()
  @IsNumber()
  contactsArchived?: number;

  @ApiPropertyOptional({ description: 'Количество размороженных контактов' })
  @IsOptional()
  @IsNumber()
  contactsUnfrozen?: number;

  @ApiPropertyOptional({ description: 'Количество обновлённых контактов' })
  @IsOptional()
  @IsNumber()
  contactsUpdated?: number;

  @ApiPropertyOptional({ description: 'Заметки пользователя' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Теги изменений' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
