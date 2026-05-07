import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MeetingStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateMeetingDto {
  @ApiProperty({ description: 'Contact ID' })
  @IsInt()
  contactId: number;

  @ApiPropertyOptional({ description: 'Meeting location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Scheduled date/time' })
  @IsOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Conversation anchors (JSON string)' })
  @IsString()
  @IsOptional()
  anchors?: string;

  @ApiPropertyOptional({ description: 'What I can give to this contact' })
  @IsString()
  @IsOptional()
  whatCanIGive?: string;
}
