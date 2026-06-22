import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuloDto {
  @IsString()
  @ApiProperty({ example: 'Introdução à Informática', description:'Título do módulo' })
  titulo_modulo!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Módules introdutório', description: 'Descrição do módulo', required: false })
  descricao_modulo?: string;

  @ApiProperty({example: 'facil', description: 'Nível de dificuldade: fácil, médio ou dificil'})
  @IsString()
  dificuldade!: string;
}