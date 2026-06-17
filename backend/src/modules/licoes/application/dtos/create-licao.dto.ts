import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLicaoDto {
  @IsString()
  titulo_licao: string;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsNumber()
  modulo_id: number;
}
