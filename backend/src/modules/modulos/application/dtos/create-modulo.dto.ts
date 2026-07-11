import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuloDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'Introdução à Informática', description: 'Título do módulo' })
  titulo_modulo!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  @ApiProperty({ example: 'Módules introdutório', description: 'Descrição do módulo', required: false })
  descricao_modulo?: string;

  @ApiProperty({ example: 'facil', description: 'Nível de dificuldade: fácil, médio ou dificil' })
  @IsString()
  dificuldade!: string;

  @ApiProperty({ example: 'https://exemplo.com/imagem.jpg', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  imagem_url?: string;

  @ApiProperty({ example: 1, description: 'ID da turma à qual o módulo pertence' })
  @IsInt()
  turma_id!: number;
}