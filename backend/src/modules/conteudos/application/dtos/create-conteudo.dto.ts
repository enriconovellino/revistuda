import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateConteudoDto {
  @ApiProperty({
    example: 'Aula de HTML Básico',
    description: 'Nome do conteúdo',
  })
  @IsString()
  nome_conteudo!: string;

  @ApiProperty({
    example: 'video',
    description: 'Tipo do conteúdo (video, audio ou texto)',
  })
  @IsString()
  tipo_conteudo!: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com/video123',
    description: 'URL/Link do conteúdo (vídeo ou áudio)',
  })
  @IsString()
  @IsOptional()
  url_conteudo?: string;

  @ApiPropertyOptional({
    example: 'Neste conteúdo vamos aprender HTML...',
    description: 'Texto do conteúdo',
  })
  @IsString()
  @IsOptional()
  texto_conteudo?: string;

  @ApiProperty({
    example: 1,
    description: 'ID da lição à qual o conteúdo pertence',
  })
  @IsInt()
  licao_id!: number;
}