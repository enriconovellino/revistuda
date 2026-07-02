import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { IConteudoRepository } from '../../domain/ports/conteudo-repository.port';
import { Conteudo } from '../../domain/entities/conteudo.entity';

@Injectable()
export class ConteudoRepository implements IConteudoRepository {
  constructor(private prisma: PrismaService) {}

  async create(conteudo: Conteudo): Promise<Conteudo> {
    const created = await this.prisma.conteudo.create({
      data: {
        nome_conteudo: conteudo.nome_conteudo,
        tipo_conteudo: conteudo.tipo_conteudo,
        video_url: conteudo.video_url,
        audio_link: conteudo.audio_link,
        texto_conteudo: conteudo.texto_conteudo,
        licao_id: conteudo.licao_id,
      },
    });
    return new Conteudo(
      created.conteudo_id,
      created.nome_conteudo,
      created.tipo_conteudo,
      created.licao_id,
      created.video_url ?? undefined,
      created.audio_link ?? undefined,
      created.texto_conteudo ?? undefined,
    );
  }

  async findAll(): Promise<Conteudo[]> {
    const conteudos = await this.prisma.conteudo.findMany();
    return conteudos.map((c) => new Conteudo(
      c.conteudo_id,
      c.nome_conteudo,
      c.tipo_conteudo,
      c.licao_id,
      c.video_url ?? undefined,
      c.audio_link ?? undefined,
      c.texto_conteudo ?? undefined,
    ));
  }

  async findById(id: number): Promise<Conteudo | null> {
    const c = await this.prisma.conteudo.findUnique({ where: { conteudo_id: id } });
    if (!c) return null;
    return new Conteudo(
      c.conteudo_id,
      c.nome_conteudo,
      c.tipo_conteudo,
      c.licao_id,
      c.video_url ?? undefined,
      c.audio_link ?? undefined,
      c.texto_conteudo ?? undefined,
    );
  }

  async update(id: number, data: Partial<Conteudo>): Promise<Conteudo> {
    const c = await this.prisma.conteudo.update({
      where: { conteudo_id: id },
      data: {
        nome_conteudo: data.nome_conteudo,
        tipo_conteudo: data.tipo_conteudo,
        video_url: data.video_url,
        audio_link: data.audio_link,
        texto_conteudo: data.texto_conteudo,
        licao_id: data.licao_id,
      },
    });
    return new Conteudo(
      c.conteudo_id,
      c.nome_conteudo,
      c.tipo_conteudo,
      c.licao_id,
      c.video_url ?? undefined,
      c.audio_link ?? undefined,
      c.texto_conteudo ?? undefined,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.conteudo.delete({ where: { conteudo_id: id } });
  }
}