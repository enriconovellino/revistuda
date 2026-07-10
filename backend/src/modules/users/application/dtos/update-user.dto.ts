import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
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

  @IsBoolean()
  @IsOptional()
  approved?: boolean;

  @IsString()
  @IsOptional()
  senha?: string;

  @IsString()
  @IsOptional()
  senha_atual?: string;
}
