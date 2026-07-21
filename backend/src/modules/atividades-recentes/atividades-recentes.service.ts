import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Registra eventos relevantes do sistema (cadastros, aprovações,
 * designações de professor) para o feed "Atividades recentes" do
 * painel admin. O registro é tolerante a falhas: um erro ao gravar
 * o log nunca deve derrubar a operação principal.
 */
@Injectable()
export class AtividadesRecentesService {
  private readonly logger = new Logger(AtividadesRecentesService.name);

  constructor(private prisma: PrismaService) {}

  async registrar(tipo: string, descricao: string): Promise<void> {
    try {
      await this.prisma.atividadeRecente.create({ data: { tipo, descricao } });
    } catch (err) {
      this.logger.warn(`Falha ao registrar atividade "${tipo}": ${err}`);
    }
  }

  async registrarDesignacaoProfessor(professorId: number | null | undefined, nomeTurma: string): Promise<void> {
    try {
      if (professorId == null) {
        await this.registrar('professor_removido', `A turma ${nomeTurma} ficou sem professor`);
        return;
      }
      const professor = await this.prisma.user.findUnique({
        where: { id: professorId },
        select: { nome: true },
      });
      if (!professor) return;
      await this.registrar(
        'professor_designado',
        `Professor(a) ${professor.nome} foi designado(a) para a turma ${nomeTurma}`,
      );
    } catch (err) {
      this.logger.warn(`Falha ao registrar designação de professor: ${err}`);
    }
  }

  async listar(limit = 30) {
    return this.prisma.atividadeRecente.findMany({
      orderBy: { data: 'desc' },
      take: limit,
    });
  }

  /**
   * Feed de atividades dos alunos das turmas de um professor (painel do
   * professor). Diferente de `listar`, não lê de uma tabela de log: monta o
   * feed em tempo real a partir do progresso real dos alunos (atividades
   * concluídas, comentários e conteúdos concluídos), sempre restrito às
   * turmas do professor autenticado.
   */
  async listarPorProfessor(professorId: number, limit = 30) {
    const turmas = await this.prisma.turma.findMany({
      where: { professor_id: professorId },
      select: { turma_id: true },
    });
    const turmaIds = turmas.map((t) => t.turma_id);
    if (turmaIds.length === 0) return [];

    const [atividadesConcluidas, comentarios, conteudosConcluidos] = await Promise.all([
      this.prisma.progressoAtividade.findMany({
        where: { status: 'feito', aluno: { turma_id: { in: turmaIds } } },
        select: {
          data_conclusao: true,
          aluno: { select: { nome: true } },
          atividade: { select: { titulo_atividade: true } },
        },
        orderBy: { data_conclusao: 'desc' },
        take: limit,
      }),
      this.prisma.comentarioAluno.findMany({
        where: { aluno: { turma_id: { in: turmaIds } } },
        select: {
          createdAt: true,
          aluno: { select: { nome: true } },
          conteudo: { select: { nome_conteudo: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.progressoConteudo.findMany({
        where: { aluno: { turma_id: { in: turmaIds } } },
        select: {
          data_conclusao: true,
          aluno: { select: { nome: true } },
          conteudo: { select: { nome_conteudo: true } },
        },
        orderBy: { data_conclusao: 'desc' },
        take: limit,
      }),
    ]);

    const eventos = [
      ...atividadesConcluidas
        .filter((p) => p.data_conclusao != null)
        .map((p) => ({
          tipo: 'atividade_concluida',
          descricao: `${p.aluno.nome} concluiu a atividade "${p.atividade.titulo_atividade}"`,
          data: p.data_conclusao as Date,
        })),
      ...comentarios.map((c) => ({
        tipo: 'comentario_aluno',
        descricao: `${c.aluno.nome} comentou em "${c.conteudo.nome_conteudo}"`,
        data: c.createdAt,
      })),
      ...conteudosConcluidos.map((p) => ({
        tipo: 'conteudo_concluido',
        descricao: `${p.aluno.nome} concluiu o conteúdo "${p.conteudo.nome_conteudo}"`,
        data: p.data_conclusao,
      })),
    ];

    return eventos
      .sort((a, b) => b.data.getTime() - a.data.getTime())
      .slice(0, limit)
      .map((evento, index) => ({ atividade_recente_id: index + 1, ...evento }));
  }
}
