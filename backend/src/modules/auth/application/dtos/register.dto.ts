import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
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
    description: 'Senha do usuário (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha!: string;

  @ApiProperty({
    example: 'ALUNO_IDOSO',
    description: 'Permissão do usuário',
    enum: ['ALUNO_IDOSO', 'PROFESSOR', 'ADM'],
  })
  @IsString()
  @IsIn(['ALUNO_IDOSO', 'PROFESSOR', 'ADM'], {
    message:
      'A permissão deve ser uma das seguintes: ALUNO_IDOSO, PROFESSOR, ADM',
  })
  permission!: string;
}