import { TaskPriority } from '@prisma/client'
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator'
import { PartialType } from '@nestjs/swagger'
import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority | null

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number | null

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
