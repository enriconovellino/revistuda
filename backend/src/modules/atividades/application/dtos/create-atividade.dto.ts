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

export class CreateItemAssociacaoDto {
  @IsString()
  @IsIn(['texto', 'imagem'])
  tipo!: string;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsString()
  imagem_url?: string;
}

export class CreateParAssociacaoDto {
  @ValidateNested()
  @Type(() => CreateItemAssociacaoDto)
  esquerdo!: CreateItemAssociacaoDto;

  @ValidateNested()
  @Type(() => CreateItemAssociacaoDto)
  direito!: CreateItemAssociacaoDto;
}

export class CreateAtividadeDto {
  @IsString()
  titulo_atividade!: string;

  @IsString()
  @IsIn(['multipla_escolha', 'associacao_imagens'])
  tipo_atividade!: string;

  @IsOptional()
  @IsString()
  enunciado?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpcaoDto)
  opcoes?: CreateOpcaoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParAssociacaoDto)
  pares_associacao?: CreateParAssociacaoDto[];

  @IsOptional()
  @IsString()
  explicacao?: string;

  @IsNumber()
  licao_id!: number;
}
