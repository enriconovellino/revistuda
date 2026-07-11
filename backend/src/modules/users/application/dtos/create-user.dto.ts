import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Tainara Anjos',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @MaxLength(100)
  nome!: string;

  @ApiProperty({
    example: 'tainara@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  @MaxLength(50)
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MaxLength(30)
  senha!: string;
}