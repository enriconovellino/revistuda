import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResponderComentarioDto {
  @ApiProperty({ description: 'Texto da resposta do professor' })
  @IsString()
  @IsNotEmpty()
  resposta!: string;
}