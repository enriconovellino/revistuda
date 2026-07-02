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
      },
    });
    return new Modulo(created.modulo_id, created.titulo_modulo, created.dificuldade, created.descricao_modulo ?? undefined);
  }

  async findAll(): Promise<Modulo[]> {
    const modulos = await this.prisma.modulo.findMany();
    return modulos.map((m) => new Modulo(m.modulo_id, m.titulo_modulo, m.dificuldade, m.descricao_modulo ?? undefined));
  }

  async findById(id: number): Promise<Modulo | null> {
    const m = await this.prisma.modulo.findUnique({ where: { modulo_id: id } });
    if (!m) return null;
    return new Modulo(m.modulo_id, m.titulo_modulo, m.dificuldade, m.descricao_modulo ?? undefined);
  }

  async update(id: number, data: Partial<Modulo>): Promise<Modulo> {
    const m = await this.prisma.modulo.update({
      where: { modulo_id: id },
      data: {
        titulo_modulo: data.titulo_modulo,
        descricao_modulo: data.descricao_modulo,
        dificuldade: data.dificuldade,
      },
    });
    return new Modulo(m.modulo_id, m.titulo_modulo, m.dificuldade, m.descricao_modulo ?? undefined);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.modulo.delete({ where: { modulo_id: id } });
  }
}