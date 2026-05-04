import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LookupUsernameDto {
  @ApiProperty({ description: 'Telegram username without @', example: 'ivanov' })
  @IsString()
  username: string;
}

export class MatchPhoneDto {
  @ApiProperty({ description: 'SHA256 hash of phone number with server salt' })
  @IsString()
  phoneHash: string;
}

export class TelegramProfileResponseDto {
  @ApiProperty()
  found: boolean;

  @ApiPropertyOptional()
  alreadyAdded?: boolean;

  @ApiPropertyOptional()
  profile?: {
    telegramId: number;
    firstName: string;
    lastName?: string;
    username?: string;
    bio?: string;
    photoUrl?: string;
    isPremium: boolean;
    languageCode?: string;
  };

  @ApiPropertyOptional()
  suggestion?: string;
}

export class PhoneMatchResponseDto {
  @ApiProperty({ type: () => Object, isArray: true })
  matches: {
    userId: number;
    name: string;
    username?: string;
    avatarUrl?: string;
  }[];
}
