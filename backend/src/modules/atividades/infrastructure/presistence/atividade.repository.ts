import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Atividade, MultiplaEscolhaDados } from '../../domain/entities/atividade.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { IAtividadeRepository } from '../../domain/ports/atividade-repository.port';

@Injectable()
export class AtividadeRepository implements IAtividadeRepository {
  constructor(private prisma: PrismaService) {}

  private mapToEntity(record: {
    atividade_id: number;
    titulo_atividade: string;
    descricao_atividade: string | null;
    tipo_atividade: string;
    dados_atividade?: unknown | null;
    licao_id: number;
  }): Atividade {
    return new Atividade(
      record.atividade_id,
      record.titulo_atividade,
      record.descricao_atividade,
      record.tipo_atividade,
      record.licao_id,
      (record.dados_atividade as MultiplaEscolhaDados | null) ?? null,
    );
  }

  async create(atividade: Atividade): Promise<Atividade> {
    const created = await this.prisma.atividade.create({
      data: {
        titulo_atividade: atividade.titulo_atividade,
        descricao_atividade: atividade.descricao_atividade,
        tipo_atividade: atividade.tipo_atividade,
        dados_atividade: (atividade.dados_atividade ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        licao_id: atividade.licao_id,
      },
    });
    return this.mapToEntity(created);
  }

  async findAll(): Promise<Atividade[]> {
    const records = await this.prisma.atividade.findMany();
    return records.map((record) => this.mapToEntity(record));
  }

  async findById(id: number): Promise<Atividade | null> {
    const atividade = await this.prisma.atividade.findUnique({
      where: { atividade_id: id },
    });
    if (!atividade) {
      return null;
    }
    return this.mapToEntity(atividade);
  }

  async update(id: number, atividade: Partial<Atividade>): Promise<Atividade> {
    const updated = await this.prisma.atividade.update({
      where: { atividade_id: id },
      data: {
        titulo_atividade: atividade.titulo_atividade,
        descricao_atividade: atividade.descricao_atividade,
        tipo_atividade: atividade.tipo_atividade,
        dados_atividade: atividade.dados_atividade as Prisma.InputJsonValue | undefined,
        licao_id: atividade.licao_id,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.atividade.delete({
      where: { atividade_id: id },
    });
  }
}
