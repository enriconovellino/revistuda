import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Max, Min } from 'class-validator';
import { MAX_ALUNOS_POR_TURMA } from '@/shared/constants/turma.constants';

export class CreateTurmaDto {
  @ApiProperty({
    example: 'Turma A - Informática Básica',
    description: 'Nome da turma',
  })
  @IsString()
  nome_turma!: string;

  @ApiPropertyOptional({
    example: 'Turma destinada a alunos iniciantes',
    description: 'Descrição da turma',
  })
  @IsString()
  @IsOptional()
  descricao_turma?: string;

  @ApiPropertyOptional({
    example: 10,
    description: `Quantidade máxima de alunos na turma (limite: ${MAX_ALUNOS_POR_TURMA})`,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_ALUNOS_POR_TURMA, { message: `capacidade_maxima não pode ser maior que ${MAX_ALUNOS_POR_TURMA}` })
  @IsOptional()
  capacidade_maxima?: number;

  @ApiProperty({
    example: 2,
    description: 'ID do professor responsável pela turma',
    required: false,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  professor_id?: number | null;
}