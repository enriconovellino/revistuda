import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}