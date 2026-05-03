import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddContactByRefDto {
  @ApiProperty({ description: 'contactId из визитки' })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiPropertyOptional({ description: 'ID пользователя, от которого пришла реферальная ссылка' })
  @IsString()
  @IsOptional()
  refUserId?: string;

  @ApiPropertyOptional({ description: 'Приватные метаданные (ОИС теги)', type: 'object' })
  @IsObject()
  @IsOptional()
  privateMeta?: Record<string, unknown>;
}
