import { PartialType } from '@nestjs/swagger'
import { CreateSubtaskDto } from './create-subtask.dto'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
  @IsBoolean()
  @IsOptional()
  completed?: boolean
}
