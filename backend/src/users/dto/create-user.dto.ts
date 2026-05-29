import { IsEmail, IsString, IsArray, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString()
  nome!: string;
  @IsEmail()
  email!: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}