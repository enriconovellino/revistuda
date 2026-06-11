import { IsString, IsOptional, IsInt } from "class-validator";

export class CreateTurmaDto {

  @IsString()
  nome_turma!: string;

  @IsString()
  @IsOptional()
  descricao_turma?: string

  @IsInt()
  @IsOptional()
  capacidade_maxima?: number;
}
