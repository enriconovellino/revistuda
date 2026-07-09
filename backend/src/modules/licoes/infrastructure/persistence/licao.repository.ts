import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ILicaoRepository } from '../../domain/ports/licao-repository.port';
import { Licao } from '../../domain/entities/licao.entity';

@Injectable()
export class LicaoRepository implements ILicaoRepository {
  constructor(private prisma: PrismaService) { }

  async create(licao: Licao): Promise<Licao> {
    const created = await this.prisma.licao.create({
      data: {
        titulo_licao: licao.titulo_licao,
        comentario: licao.comentario,
        modulo_id: licao.modulo_id,
      },
    });
    return new Licao(
      created.licao_id,
      created.titulo_licao,
      created.modulo_id,
      created.comentario ?? undefined,
    );
  }

  async findAll(userId?: number): Promise<Licao[]> {
    let whereCondicao = {};
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && (user.permissions.includes('ALUNO_IDOSO') || user.permissions.includes('ALUNO_CRIANCA')) && !user.permissions.includes('ADM')) {
        whereCondicao = {
          modulo: {
            turma_id: user.turma_id ?? -1,
          },
        };
      }
    }

    const licoes = await this.prisma.licao.findMany({
      where: whereCondicao
    });
    return licoes.map((l) => new Licao(
      l.licao_id,
      l.titulo_licao,
      l.modulo_id,
      l.comentario ?? undefined,
    ));
  }

  async findById(id: number): Promise<Licao | null> {
    const l = await this.prisma.licao.findUnique({ where: { licao_id: id } });
    if (!l) return null;
    return new Licao(
      l.licao_id,
      l.titulo_licao,
      l.modulo_id,
      l.comentario ?? undefined,
    );
  }

  async update(id: number, licao: Partial<Licao>): Promise<Licao> {
    const updated = await this.prisma.licao.update({
      where: { licao_id: id },
      data: {
        titulo_licao: licao.titulo_licao,
        comentario: licao.comentario,
        modulo_id: licao.modulo_id,
      },
    });
    return new Licao(
      updated.licao_id,
      updated.titulo_licao,
      updated.modulo_id,
      updated.comentario ?? undefined,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.licao.delete({ where: { licao_id: id } });
  }
}
