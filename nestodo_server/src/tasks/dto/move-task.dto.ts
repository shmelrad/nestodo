import { IsNotEmpty, IsNumber } from 'class-validator';

export class MoveTaskDto {
  @IsNumber()
  @IsNotEmpty()
  sourceTaskListId: number;

  @IsNumber()
  @IsNotEmpty()
  destinationTaskListId: number;

  @IsNumber()
  @IsNotEmpty()
  newPosition: number;
} 