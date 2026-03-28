import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'Telegram initData from WebApp' })
  @IsString()
  @IsNotEmpty()
  initData: string;
}
