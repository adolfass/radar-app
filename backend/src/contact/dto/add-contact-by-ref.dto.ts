import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
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
}
