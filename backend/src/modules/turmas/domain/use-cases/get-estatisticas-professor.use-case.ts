import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface EstatisticasProfessor {
  totalTurmas: number;
  totalAlunos: number;
  totalRespostas: number;
  acertos: number;
  erros: number;
  naoRespondeu: number;
}

@Injectable()
export class GetEstatisticasProfessorUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(professorId: number): Promise<EstatisticasProfessor> {
    const turmas = await this.prisma.turma.findMany({
      where: { professor_id: professorId },
      include: { alunos: true },
    });

    const totalTurmas = turmas.length;

    const alunoIds = new Set<number>();
    turmas.forEach((t) => t.alunos.forEach((a) => alunoIds.add(a.id)));
    const totalAlunos = alunoIds.size;

    const turmaIds = turmas.map((t) => t.turma_id);

    const respostasME = await this.prisma.respostaMultiplaEscolha.findMany({
      where: {
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
        opcao: { select: { correta: true } },
      },
    });

    const acertos = respostasME.filter((r) => r.opcao.correta).length;
    const erros = respostasME.filter((r) => !r.opcao.correta).length;

    const totalTentativasAssociacao = await this.prisma.tentativaAssociacao.count({
      where: {
        associacao: {
          atividade: {
            licao: {
              modulo: {
                turma_id: { in: turmaIds },
              },
            },
          },
        },
      },
    });

    const totalRespostas = respostasME.length + totalTentativasAssociacao;

    const totalAtividadesMultiplaEscolha = await this.prisma.atividade.count({
      where: {
        multipla_escolha: { isNot: null },
        licao: {
          modulo: {
            turma_id: { in: turmaIds },
          },
        },
      },
    });

    const totalEsperado = totalAtividadesMultiplaEscolha * totalAlunos;
    const naoRespondeu = Math.max(totalEsperado - respostasME.length, 0);

    return {
      totalTurmas,
      totalAlunos,
      totalRespostas,
      acertos,
      erros,
      naoRespondeu,
    };
  }
}