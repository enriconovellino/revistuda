import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

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
    example: 30,
    description: 'Quantidade máxima de alunos na turma',
  })
  @IsInt()
  @IsOptional()
  capacidade_maxima?: number;

  @ApiProperty({
    example: 2,
    description: 'ID do professor responsável pela turma',
  })
  @IsInt()
  professor_id!: number;
}