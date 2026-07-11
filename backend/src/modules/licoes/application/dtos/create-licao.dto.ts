import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateLicaoDto {
  @ApiProperty({
    example: 'Introdução ao HTML',
    description: 'Título da lição',
  })
  @IsString()
  @MaxLength(100)
  titulo_licao!: string;

  @ApiPropertyOptional({
    example: 'Lição introdutória sobre tags básicas',
    description: 'Comentário ou observação da lição',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentario?: string;

  @ApiProperty({
    example: 1,
    description: 'ID do módulo ao qual a lição pertence',
  })
  @IsNumber()
  modulo_id!: number;
}
