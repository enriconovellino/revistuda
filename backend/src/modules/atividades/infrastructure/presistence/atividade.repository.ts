import { Injectable } from '@nestjs/common';
import { Atividade, Opcao } from '../../domain/entities/atividade.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { IAtividadeRepository } from '../../domain/ports/atividade-repository.port';

@Injectable()
export class AtividadeRepository implements IAtividadeRepository {
  constructor(private prisma: PrismaService) {}

  private mapToEntity(record: any): Atividade {
    const opcoes = record.opcoes ? record.opcoes.map((o: any) => new Opcao(
      o.opcao_id,
      o.texto_opcao,
      o.letra,
      o.correta,
      o.atividade_id
    )) : [];

    return new Atividade(
      record.atividade_id,
      record.titulo_atividade,
      record.tipo_atividade,
      record.licao_id,
      record.enunciado,
      opcoes,
    );
  }

  async create(atividade: Atividade): Promise<Atividade> {
    const created = await this.prisma.atividade.create({
      data: {
        titulo_atividade: atividade.titulo_atividade,
        tipo_atividade: atividade.tipo_atividade,
        enunciado: atividade.enunciado,
        licao_id: atividade.licao_id,
        opcoes: {
          create: (atividade.opcoes ?? []).map((o) => ({
            texto_opcao: o.texto_opcao,
            letra: o.letra,
            correta: o.correta,
          })),
        },
      },
      include: {
        opcoes: true,
      },
    });
    return this.mapToEntity(created);
  }

  async findAll(): Promise<Atividade[]> {
    const records = await this.prisma.atividade.findMany({
      include: {
        opcoes: true,
      },
    });
    return records.map((record) => this.mapToEntity(record));
  }

  async findById(id: number): Promise<Atividade | null> {
    const record = await this.prisma.atividade.findUnique({
      where: { atividade_id: id },
      include: {
        opcoes: true,
      },
    });
    if (!record) {
      return null;
    }
    return this.mapToEntity(record);
  }

  async update(id: number, atividade: Partial<Atividade>): Promise<Atividade> {
    const dataUpdate: any = {
      titulo_atividade: atividade.titulo_atividade,
      tipo_atividade: atividade.tipo_atividade,
      enunciado: atividade.enunciado,
      licao_id: atividade.licao_id,
    };

    if (atividade.opcoes) {
      dataUpdate.opcoes = {
        deleteMany: {},
        create: atividade.opcoes.map((o) => ({
          texto_opcao: o.texto_opcao,
          letra: o.letra,
          correta: o.correta,
        })),
      };
    }

    const updated = await this.prisma.atividade.update({
      where: { atividade_id: id },
      data: dataUpdate,
      include: {
        opcoes: true,
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
