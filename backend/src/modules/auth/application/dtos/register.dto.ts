import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha!: string;

  @IsString()
  @IsIn(['ALUNO_CRIANCA', 'ALUNO_IDOSO', 'PROFESSOR', 'ADM'], {
    message: 'A permissão deve ser uma das seguintes: ALUNO_CRIANCA, ALUNO_IDOSO, PROFESSOR, ADM',
  })
  permission!: string;
}
