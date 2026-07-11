import { IsInt, IsString, MinLength, MaxLength } from 'class-validator';

export class SaveComentarioDto {
  @IsInt()
  conteudoId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  texto!: string;
}