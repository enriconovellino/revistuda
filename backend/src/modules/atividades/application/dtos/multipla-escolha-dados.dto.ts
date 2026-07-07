import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OpcaoMultiplaEscolhaDto {
  @IsString()
  @IsIn(['a', 'b', 'c', 'd'])
  id!: string;

  @IsString()
  texto!: string;
}

export class MultiplaEscolhaDadosDto {
  @IsString()
  enunciado!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => OpcaoMultiplaEscolhaDto)
  opcoes!: OpcaoMultiplaEscolhaDto[];

  @IsString()
  @IsIn(['a', 'b', 'c', 'd'])
  resposta_correta!: string;
}
