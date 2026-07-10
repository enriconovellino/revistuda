import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { IModuloRepository } from '../../domain/ports/modulo-repository.port';
import { Modulo } from '../../domain/entities/modulo.entity';

@Injectable()
export class ModuloRepository implements IModuloRepository {
  constructor(private prisma: PrismaService) {}

  async create(modulo: Modulo): Promise<Modulo> {
    const created = await this.prisma.modulo.create({
      data: {
        titulo_modulo: modulo.titulo_modulo,
        descricao_modulo: modulo.descricao_modulo,
        dificuldade: modulo.dificuldade,
        imagem_url: modulo.imagem_url,
        turma_id: modulo.turma_id,
      },
    });
    return new Modulo(created.modulo_id, created.titulo_modulo, created.dificuldade, created.turma_id, created.descricao_modulo ?? undefined, created.imagem_url ?? undefined);
  }

  async findAll(userId?: number): Promise<Modulo[]> {
    let whereCondicao = {};

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const isAdm = user.permissions.includes('ADM');
        const isAluno =
          (user.permissions.includes('ALUNO_IDOSO') ||
            user.permissions.includes('ALUNO_CRIANCA')) &&
          !isAdm;
        const isProfessor =
          user.permissions.includes('PROFESSOR') && !isAdm;

        if (isAluno) {
          whereCondicao = user.turma_id
            ? { turma_id: user.turma_id }
            : { turma_id: -1 };
        } else if (isProfessor) {
          whereCondicao = {
            turma: { professor_id: userId },
          };
        }
      }
    }

    const modulos = await this.prisma.modulo.findMany({
      where: whereCondicao,
    });
    return modulos.map((m) => new Modulo(m.modulo_id, m.titulo_modulo, m.dificuldade, m.turma_id, m.descricao_modulo ?? undefined, m.imagem_url ?? undefined));
  }

  async findById(id: number): Promise<Modulo | null> {
    const m = await this.prisma.modulo.findUnique({ where: { modulo_id: id } });
    if (!m) return null;
    return new Modulo(m.modulo_id, m.titulo_modulo, m.dificuldade, m.turma_id, m.descricao_modulo ?? undefined, m.imagem_url ?? undefined);
  }

  async update(id: number, data: Partial<Modulo>): Promise<Modulo> {
    const m = await this.prisma.modulo.update({
      where: { modulo_id: id },
      data: {
        titulo_modulo: data.titulo_modulo,
        descricao_modulo: data.descricao_modulo,
        dificuldade: data.dificuldade,
        imagem_url: data.imagem_url,
        turma_id: data.turma_id,
      },
    });
    return new Modulo(m.modulo_id, m.titulo_modulo, m.dificuldade, m.turma_id, m.descricao_modulo ?? undefined, m.imagem_url ?? undefined);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.modulo.delete({ where: { modulo_id: id } });
  }
}