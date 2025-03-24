import { IsArray, IsNumber } from 'class-validator'

export class ReorderTaskListsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  taskListIds: number[]
}
