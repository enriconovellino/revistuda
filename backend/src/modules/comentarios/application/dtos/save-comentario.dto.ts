import { IsInt, IsString, MinLength } from 'class-validator';

export class SaveComentarioDto {
  @IsInt()
  conteudoId!: number;

  @IsString()
  @MinLength(1)
  texto!: string;
}