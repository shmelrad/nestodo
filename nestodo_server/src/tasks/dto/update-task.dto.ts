import { IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsNumber()
  @IsOptional()
  duration?: number | null;
}
