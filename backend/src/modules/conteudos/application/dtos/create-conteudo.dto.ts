import { IsString, IsOptional } from 'class-validator';

export class CreateConteudoDto {
  @IsString()
  nome_conteudo!: string;

  @IsString()
  tipo_conteudo!: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsOptional()
  audio_link?: string;

  @IsString()
  @IsOptional()
  texto_conteudo?: string;
}