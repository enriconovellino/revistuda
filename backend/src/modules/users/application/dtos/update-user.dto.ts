import { IsArray, IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
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

  @IsBoolean()
  @IsOptional()
  rejected?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  senha?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  senha_atual?: string;

  @ValidateIf((o) => o.turma_id !== null)
  @IsInt()
  @IsOptional()
  turma_id?: number | null;
}
