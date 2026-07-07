import {
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MultiplaEscolhaDadosDto } from './multipla-escolha-dados.dto';

export class CreateAtividadeDto {
  @IsString()
  titulo_atividade!: string;

  @IsOptional()
  @IsString()
  descricao_atividade?: string | null;

  @IsString()
  @IsIn(['multipla_escolha'])
  tipo_atividade!: string;

  @ValidateIf((o) => o.tipo_atividade === 'multipla_escolha')
  @ValidateNested()
  @Type(() => MultiplaEscolhaDadosDto)
  dados_atividade!: MultiplaEscolhaDadosDto;

  @IsNumber()
  licao_id!: number;
}
