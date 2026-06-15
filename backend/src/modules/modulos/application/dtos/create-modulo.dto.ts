import { IsString, IsOptional } from 'class-validator';

export class CreateModuloDto {
  @IsString()
  titulo_modulo!: string;

  @IsString()
  @IsOptional()
  descricao_modulo?: string;

  @IsString()
  dificuldade!: string;
}