import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { MailerService } from '@/shared/infrastructure/mailer/mailer.service';
import { MAX_ALUNOS_POR_TURMA } from '@/shared/constants/turma.constants';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) { }

  async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.senha, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    if (!user.approved) {
      throw new UnauthorizedException('Aguarde a aprovação do administrador para acessar o sistema');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const { senha: _, refreshToken: __, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail');
    }

    const hashedPassword = await bcrypt.hash(registerDto.senha, 10);
    const approved = registerDto.permission !== 'PROFESSOR';

    let connection: any = {};
    if (registerDto.permission === 'ALUNO_IDOSO') {
      const turmas = await this.prisma.turma.findMany({
        include: { _count: { select: { alunos: true } } },
        orderBy: { turma_id: 'asc' },
      });

      // Aloca na primeira turma com vaga, respeitando o limite global de alunos.
      let turmaDestino: { turma_id: number } | undefined = turmas.find(
        (t) => t._count.alunos < Math.min(t.capacidade_maxima ?? MAX_ALUNOS_POR_TURMA, MAX_ALUNOS_POR_TURMA),
      );

      if (!turmaDestino && turmas.length === 0) {
        turmaDestino = await this.prisma.turma.create({
          data: {
            nome_turma: 'Turma Geral',
            descricao_turma: 'Turma de entrada para novos alunos',
          },
        });
      }

      // Se todas as turmas estiverem cheias, o aluno fica sem turma até o admin alocar.
      if (turmaDestino) {
        connection = {
          turma: {
            connect: { turma_id: turmaDestino.turma_id },
          },
        };
      }
    }

    const createdUser = await this.prisma.user.create({
      data: {
        nome: registerDto.nome,
        email: registerDto.email,
        senha: hashedPassword,
        permissions: [registerDto.permission],
        approved,
        ...connection,
      },
    });

    const tokens = await this.generateTokens(createdUser.id, createdUser.email);

    const { senha: _, refreshToken: __, ...userWithoutPassword } = createdUser;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Acesso negado');
      }

      const isRefreshTokenMatching = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenMatching) {
        throw new UnauthorizedException('Token de atualização inválido ou expirado');
      }

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Token de atualização inválido ou expirado');
    }
  }

  async validateUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { senha: _, refreshToken: __, ...userWithoutSecrets } = user;
    return userWithoutSecrets;
  }

  // --- Recuperação de senha ---

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // Por segurança, sempre retorna a mesma mensagem, exista ou não o e-mail.
    // Isso evita que alguém descubra quais e-mails estão cadastrados no sistema.
    if (!user) {
      return { message: 'Se este e-mail estiver cadastrado, você receberá um link de recuperação.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // expira em 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await this.mailerService.sendPasswordResetEmail(user.email, user.nome, resetToken);

    return { message: 'Se este e-mail estiver cadastrado, você receberá um link de recuperação.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado. Solicite uma nova recuperação de senha.');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.novaSenha, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        senha: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null, // invalida sessões antigas por segurança
      },
    });

    return { message: 'Senha redefinida com sucesso. Você já pode fazer login.' };
  }
}