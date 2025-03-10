import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
} 