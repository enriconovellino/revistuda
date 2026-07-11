import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nome?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(50)
  email?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsBoolean()
  @IsOptional()
  approved?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  senha?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  senha_atual?: string;
}
