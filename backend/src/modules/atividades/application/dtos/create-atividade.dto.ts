import {
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOpcaoDto {
  @IsString()
  texto_opcao!: string;

  @IsString()
  @IsIn(['a', 'b', 'c', 'd'])
  letra!: string;

  @IsBoolean()
  correta!: boolean;
}

export class CreateAtividadeDto {
  @IsString()
  titulo_atividade!: string;

  @IsString()
  @IsIn(['multipla_escolha'])
  tipo_atividade!: string;

  @IsOptional()
  @IsString()
  enunciado?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpcaoDto)
  opcoes?: CreateOpcaoDto[];

  @IsNumber()
  licao_id!: number;
}
