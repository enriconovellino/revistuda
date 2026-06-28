import { Injectable } from '@nestjs/common';
import { Atividade } from '../../domain/entities/atividade.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { IAtividadeRepository } from '../../domain/ports/atividade-repository.port';

@Injectable()
export class AtividadeRepository implements IAtividadeRepository {
    constructor(private prisma: PrismaService) {}

    async create(atividade: Atividade): Promise<Atividade> {
        const created = await this.prisma.atividade.create({
            data: {
                titulo_atividade: atividade.titulo_atividade,
                descricao_atividade: atividade.descricao_atividade,
                tipo_atividade: atividade.tipo_atividade,
                licao_id: atividade.licao_id,
            }
        });
        return new Atividade(
            created.atividade_id,
            created.titulo_atividade,
            created.descricao_atividade,
            created.tipo_atividade,
            created.licao_id
        );
    }

    async findAll(): Promise<Atividade[]> {
        return this.prisma.atividade.findMany();
    }

    async findById(id: number): Promise<Atividade | null> {
        const atividade = await this.prisma.atividade.findUnique({
            where: {
                atividade_id: id
            }
        });
        if (!atividade) {
            return null;
        }
        return new Atividade(
            atividade.atividade_id,
            atividade.titulo_atividade,
            atividade.descricao_atividade,
            atividade.tipo_atividade,
            atividade.licao_id
        );
    }

    async update(id: number, atividade: Partial<Atividade>): Promise<Atividade> {
        const updated = await this.prisma.atividade.update({
            where: {
                atividade_id: id
            },
            data: atividade
        });
        return updated;
    }

    async delete(id: number): Promise<void> {
        await this.prisma.atividade.delete({
            where: {
                atividade_id: id
            }
        });
    }
}