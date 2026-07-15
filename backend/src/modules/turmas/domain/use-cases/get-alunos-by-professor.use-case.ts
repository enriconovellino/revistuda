import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface DesempenhoAluno {
  acertos: number;
  erros: number;
  totalRespostas: number;
  taxaAcerto: number;
}

export interface AlunoProfessor {
  aluno_id: number;
  nome: string;
  email: string;
  turma_id: number;
  nome_turma: string;
  desempenho: DesempenhoAluno;
}

@Injectable()
export class GetAlunosByProfessorUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(professorId: number): Promise<AlunoProfessor[]> {
    const turmas = await this.prisma.turma.findMany({
      where: { professor_id: professorId },
      select: {
        turma_id: true,
        nome_turma: true,
        alunos: { select: { id: true, nome: true, email: true } },
      },
    });

    if (turmas.length === 0) {
      return [];
    }

    const turmaIds = turmas.map((t) => t.turma_id);
    const alunoIds = turmas.flatMap((t) => t.alunos.map((a) => a.id));

    const respostasME =
      alunoIds.length === 0
        ? []
        : await this.prisma.respostaMultiplaEscolha.findMany({
            where: {
              aluno_id: { in: alunoIds },
              opcao: {
                multipla_escolha: {
                  atividade: {
                    licao: {
                      modulo: {
                        turma_id: { in: turmaIds },
                      },
                    },
                  },
                },
              },
            },
            select: {
              aluno_id: true,
              opcao: { select: { correta: true } },
            },
          });

    const desempenhoPorAluno = new Map<number, { acertos: number; erros: number }>();

    for (const resposta of respostasME) {
      const atual = desempenhoPorAluno.get(resposta.aluno_id) ?? { acertos: 0, erros: 0 };
      if (resposta.opcao.correta) {
        atual.acertos += 1;
      } else {
        atual.erros += 1;
      }
      desempenhoPorAluno.set(resposta.aluno_id, atual);
    }

    const resultado: AlunoProfessor[] = [];

    for (const turma of turmas) {
      for (const aluno of turma.alunos) {
        const stats = desempenhoPorAluno.get(aluno.id) ?? { acertos: 0, erros: 0 };
        const totalRespostas = stats.acertos + stats.erros;
        const taxaAcerto =
          totalRespostas === 0 ? 0 : Math.round((stats.acertos / totalRespostas) * 100);

        resultado.push({
          aluno_id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          turma_id: turma.turma_id,
          nome_turma: turma.nome_turma,
          desempenho: {
            acertos: stats.acertos,
            erros: stats.erros,
            totalRespostas,
            taxaAcerto,
          },
        });
      }
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }
}
