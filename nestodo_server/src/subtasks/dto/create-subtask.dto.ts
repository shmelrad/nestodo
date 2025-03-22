import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubtaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    taskId: number;
}
