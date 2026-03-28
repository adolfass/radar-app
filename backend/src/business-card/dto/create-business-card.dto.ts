import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessCardDto {
  @ApiPropertyOptional({ description: 'Название компании/бизнеса' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Ресурсы (ссылки, соцсети)', type: Object })
  @IsObject()
  @IsOptional()
  resources?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Личные данные', type: Object })
  @IsObject()
  @IsOptional()
  personalData?: Record<string, string>;
}
