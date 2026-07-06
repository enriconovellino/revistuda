import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ITurmaRepository } from '../../domain/ports/turma-repository.port';
import { Turma } from '../../domain/entities/turma.entity';

@Injectable()
export class TurmaRepository implements ITurmaRepository {
  constructor(private prisma: PrismaService) {}

  async create(turma: Turma): Promise<Turma> {
    const created = await this.prisma.turma.create({
      data: {
        nome_turma: turma.nome_turma,
        descricao_turma: turma.descricao_turma,
        capacidade_maxima: turma.capacidade_maxima,
        professor_id: turma.professor_id,
      },
    });
    return new Turma(created.turma_id, created.nome_turma, created.professor_id, created.descricao_turma ?? undefined, created.capacidade_maxima ?? undefined);
  }

  async findAll(): Promise<Turma[]> {
    const turmas = await this.prisma.turma.findMany();
    return turmas.map((t) => new Turma(t.turma_id, t.nome_turma, t.professor_id, t.descricao_turma ?? undefined, t.capacidade_maxima ?? undefined));
  }

  async findById(id: number): Promise<Turma | null> {
    const t = await this.prisma.turma.findUnique({ where: { turma_id: id } });
    if (!t) return null;
    return new Turma(t.turma_id, t.nome_turma, t.professor_id, t.descricao_turma ?? undefined, t.capacidade_maxima ?? undefined);
  }

  async update(id: number, data: Partial<Turma>): Promise<Turma> {
    const t = await this.prisma.turma.update({
      where: { turma_id: id },
      data: {
        nome_turma: data.nome_turma,
        descricao_turma: data.descricao_turma,
        capacidade_maxima: data.capacidade_maxima,
        professor_id: data.professor_id,
      },
    });
    return new Turma(t.turma_id, t.nome_turma, t.professor_id, t.descricao_turma ?? undefined, t.capacidade_maxima ?? undefined);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.turma.delete({ where: { turma_id: id } });
  }

  async findByProfessorId(professorId: number): Promise<Turma[]> {
    const turmas = await this.prisma.turma.findMany({
      where: { professor_id: professorId },
    });

    return turmas.map(
      (t) =>
        new Turma(
          t.turma_id,
          t.nome_turma,
          t.professor_id,
          t.descricao_turma ?? undefined,
          t.capacidade_maxima ?? undefined,
        ),
    );
  }
}