import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Tainara Anjos',
    description: 'Nome completo do usuário',
  })
  @IsString()
  nome!: string;

  @ApiProperty({
    example: 'tainara@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário',
  })
  @IsString()
  senha!: string;
}