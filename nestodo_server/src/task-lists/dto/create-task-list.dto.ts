import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTaskListDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    boardId: number;
}
