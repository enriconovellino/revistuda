import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4...' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token!: string;

  @ApiProperty({ example: 'novaSenha123' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  novaSenha!: string;
}