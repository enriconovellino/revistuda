import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MaxLength(30)
  senha!: string;
}
