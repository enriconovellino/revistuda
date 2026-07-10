import { IsArray, IsBoolean, IsEmail, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
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

  @ValidateIf((o) => o.turma_id !== null)
  @IsInt()
  @IsOptional()
  turma_id?: number | null;
}
