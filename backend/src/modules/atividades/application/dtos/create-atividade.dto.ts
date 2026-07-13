import {
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  IsBoolean,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOpcaoDto {
  @IsString()
  @MaxLength(150)
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
  @MaxLength(200)
  texto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
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
  @MaxLength(100)
  titulo_atividade!: string;

  @IsString()
  @IsIn(['multipla_escolha', 'associacao_imagens'])
  tipo_atividade!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  enunciado?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explicacao?: string | null;

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

  @IsNumber()
  licao_id!: number;
}
