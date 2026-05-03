import { PartialType } from '@nestjs/swagger';
import { CreateBqgDto } from './create-bqg.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBqgDto extends PartialType(CreateBqgDto) {
  @ApiPropertyOptional({ description: 'Активность группировки' })
  isActive?: boolean;
}
