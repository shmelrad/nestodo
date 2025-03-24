import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsNotEmpty()
  workspaceId: number
}
