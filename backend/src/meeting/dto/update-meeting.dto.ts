import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingStatus } from './create-meeting.dto';

export class UpdateMeetingDto {
  @ApiPropertyOptional({ description: 'Meeting status' })
  @IsEnum(MeetingStatus)
  @IsOptional()
  status?: MeetingStatus;

  @ApiPropertyOptional({ description: 'Notes during meeting' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Outcomes and action items (JSON string)' })
  @IsString()
  @IsOptional()
  outcomes?: string;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsOptional()
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Actual meeting date/time' })
  @IsOptional()
  actualAt?: Date;
}
