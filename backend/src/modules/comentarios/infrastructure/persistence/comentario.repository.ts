import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { IComentarioRepository, ComentarioComAluno, ComentarioResumo } from '../../domain/ports/comentario-repository.port';
import { Comentario } from '../../domain/entities/comentario.entity';

@Injectable()
export class ComentarioRepository implements IComentarioRepository {
  constructor(private prisma: PrismaService) { }

  async upsert(alunoId: number, conteudoId: number, texto: string): Promise<Comentario> {
    const salvo = await this.prisma.comentarioAluno.upsert({
      where: { alunoId_conteudoId: { alunoId, conteudoId } },
      update: { texto },
      create: { alunoId, conteudoId, texto },
    });

    return new Comentario(
      salvo.id,
      salvo.texto,
      salvo.alunoId,
      salvo.conteudoId,
      salvo.createdAt,
      salvo.updatedAt,
    );
  }

  async findByAlunoAndConteudo(alunoId: number, conteudoId: number): Promise<Comentario | null> {
    const c = await this.prisma.comentarioAluno.findUnique({
      where: { alunoId_conteudoId: { alunoId, conteudoId } },
    });
    if (!c) return null;

    return new Comentario(c.id, c.texto, c.alunoId, c.conteudoId, c.createdAt, c.updatedAt);
  }

  async findByConteudo(conteudoId: number): Promise<ComentarioComAluno[]> {
    const comentarios = await this.prisma.comentarioAluno.findMany({
      where: { conteudoId },
      include: {
        aluno: { select: { id: true, nome: true } },
        conteudo: { select: { conteudo_id: true, nome_conteudo: true, licao_id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return comentarios.map((c) => ({
      id: c.id,
      texto: c.texto,
      alunoId: c.alunoId,
      conteudoId: c.conteudoId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      resposta: c.resposta,
      respostaAt: c.respostaAt,
      aluno: c.aluno,
      conteudo: c.conteudo,
    }));
  }

  async findByModulo(moduloId: number): Promise<ComentarioComAluno[]> {
    const comentarios = await this.prisma.comentarioAluno.findMany({
      where: {
        conteudo: {
          licao: {
            modulo_id: moduloId,
          },
        },
      },
      include: {
        aluno: { select: { id: true, nome: true } },
        conteudo: { select: { conteudo_id: true, nome_conteudo: true, licao_id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return comentarios.map((c) => ({
      id: c.id,
      texto: c.texto,
      alunoId: c.alunoId,
      conteudoId: c.conteudoId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      resposta: c.resposta,
      respostaAt: c.respostaAt,
      aluno: c.aluno,
      conteudo: c.conteudo,
    }));
  }

  async responder(id: number, resposta: string): Promise<Comentario> {
    const salvo = await this.prisma.comentarioAluno.update({
      where: { id },
      data: { resposta, respostaAt: new Date() },
    });

    return new Comentario(
      salvo.id,
      salvo.texto,
      salvo.alunoId,
      salvo.conteudoId,
      salvo.createdAt,
      salvo.updatedAt,
      salvo.resposta,
      salvo.respostaAt,
    );
  }

  async findByProfessor(professorId: number): Promise<ComentarioResumo[]> {
    const comentarios = await this.prisma.comentarioAluno.findMany({
      where: {
        conteudo: {
          licao: {
            modulo: {
              turma: {
                professor_id: professorId,
              },
            },
          },
        },
      },
      include: {
        aluno: { select: { id: true, nome: true } },
        conteudo: {
          select: {
            conteudo_id: true,
            nome_conteudo: true,
            licao: {
              select: {
                licao_id: true,
                titulo_licao: true,
                modulo: {
                  select: {
                    modulo_id: true,
                    titulo_modulo: true,
                    turma: { select: { turma_id: true, nome_turma: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return comentarios.map((c) => ({
      id: c.id,
      texto: c.texto,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      aluno: c.aluno,
      conteudo: {
        conteudo_id: c.conteudo.conteudo_id,
        nome_conteudo: c.conteudo.nome_conteudo,
      },
      licao: {
        licao_id: c.conteudo.licao.licao_id,
        titulo_licao: c.conteudo.licao.titulo_licao,
      },
      modulo: {
        modulo_id: c.conteudo.licao.modulo.modulo_id,
        titulo_modulo: c.conteudo.licao.modulo.titulo_modulo,
      },
      turma: {
        turma_id: c.conteudo.licao.modulo.turma.turma_id,
        nome_turma: c.conteudo.licao.modulo.turma.nome_turma,
      },
    }));
  }
}