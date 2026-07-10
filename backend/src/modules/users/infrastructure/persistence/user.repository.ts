import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MAX_ALUNOS_POR_TURMA } from '@/shared/constants/turma.constants';
import type { IUserRepository } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        nome: user.nome,
        email: user.email,
        senha: user.senha,
        permissions: user.permissions,
        approved: user.approved,
      },
    });

    return new User(createdUser.id, createdUser.nome, createdUser.email, createdUser.senha, createdUser.permissions, createdUser.approved, createdUser.turma_id);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => new User(u.id, u.nome, u.email, u.senha, u.permissions, u.approved, u.turma_id));
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return new User(user.id, user.nome, user.email, user.senha, user.permissions, user.approved, user.turma_id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return new User(user.id, user.nome, user.email, user.senha, user.permissions, user.approved, user.turma_id);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    if (typeof data.turma_id === 'number') {
      const turma = await this.prisma.turma.findUnique({
        where: { turma_id: data.turma_id },
        include: { _count: { select: { alunos: true } } },
      });
      if (!turma) {
        throw new NotFoundException(`Turma com id ${data.turma_id} não encontrada`);
      }
      const current = await this.prisma.user.findUnique({ where: { id }, select: { turma_id: true } });
      const jaEstaNaTurma = current?.turma_id === data.turma_id;
      const limite = Math.min(turma.capacidade_maxima ?? MAX_ALUNOS_POR_TURMA, MAX_ALUNOS_POR_TURMA);
      if (!jaEstaNaTurma && turma._count.alunos >= limite) {
        throw new BadRequestException(`A turma "${turma.nome_turma}" já atingiu o limite de ${limite} aluno(s)`);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        permissions: data.permissions,
        approved: data.approved,
        turma_id: data.turma_id,
      },
    });

    return new User(updatedUser.id, updatedUser.nome, updatedUser.email, updatedUser.senha, updatedUser.permissions, updatedUser.approved, updatedUser.turma_id);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async revokeProfessorAccess(id: number): Promise<{ user: User; turmasDesalocadas: number }> {
    const [updatedUser, { count }] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { approved: false, refreshToken: null },
      }),
      this.prisma.turma.updateMany({
        where: { professor_id: id },
        data: { professor_id: null },
      }),
    ]);

    return {
      user: new User(updatedUser.id, updatedUser.nome, updatedUser.email, updatedUser.senha, updatedUser.permissions, updatedUser.approved, updatedUser.turma_id),
      turmasDesalocadas: count,
    };
  }
}
