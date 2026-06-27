import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLicaoDto {
  @ApiProperty({
    example: 'Introdução ao HTML',
    description: 'Título da lição',
  })
  @IsString()
  titulo_licao!: string;

  @ApiPropertyOptional({
    example: 'Lição introdutória sobre tags básicas',
    description: 'Comentário ou observação da lição',
  })
  @IsOptional()
  @IsString()
  comentario?: string;

  @ApiProperty({
    example: 1,
    description: 'ID do módulo ao qual a lição pertence',
  })
  @IsNumber()
  modulo_id!: number;
}
