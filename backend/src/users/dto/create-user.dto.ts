import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  senha!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}