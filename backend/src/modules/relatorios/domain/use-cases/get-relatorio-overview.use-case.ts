import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { UseCase } from '@/shared/interfaces/use-case.interface';

export interface MediaPorTurma {
  turmaId: number;
  nome: string;
  media: number | null;
  totalRespostas: number;
}

export interface MediaPorModulo {
  moduloId: number;
  nome: string;
  media: number | null;
  totalRespostas: number;
}

export interface RelatorioOverview {
  totalAlunos: number;
  totalProfessores: number;
  totalModulos: number;
  totalLicoes: number;
  totalAtividadesRespondidas: number;
  mediaPorTurma: MediaPorTurma[];
  mediaPorModulo: MediaPorModulo[];
}

interface Agregado {
  total: number;
  corretas: number;
}

@Injectable()
export class GetRelatorioOverviewUseCase implements UseCase<void, RelatorioOverview> {
  constructor(private prisma: PrismaService) {}

  async execute(): Promise<RelatorioOverview> {
    const [
      totalAlunos,
      totalProfessores,
      totalModulos,
      totalLicoes,
      totalAtividadesRespondidas,
      turmas,
      modulos,
      respostas,
    ] = await Promise.all([
      this.prisma.user.count({ where: { permissions: { hasSome: ['ALUNO_IDOSO', 'ALUNO_CRIANCA'] } } }),
      this.prisma.user.count({ where: { permissions: { has: 'PROFESSOR' }, approved: true } }),
      this.prisma.modulo.count(),
      this.prisma.licao.count(),
      this.prisma.respostaMultiplaEscolha.count(),
      this.prisma.turma.findMany({ select: { turma_id: true, nome_turma: true } }),
      this.prisma.modulo.findMany({ select: { modulo_id: true, titulo_modulo: true } }),
      this.prisma.respostaMultiplaEscolha.findMany({
        select: {
          aluno: { select: { turma_id: true } },
          opcao: {
            select: {
              correta: true,
              multipla_escolha: {
                select: {
                  atividade: {
                    select: {
                      licao: { select: { modulo_id: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const porTurma = new Map<number, Agregado>();
    const porModulo = new Map<number, Agregado>();

    for (const resposta of respostas) {
      const correta = resposta.opcao?.correta ?? false;
      const turmaId = resposta.aluno?.turma_id ?? null;
      const moduloId = resposta.opcao?.multipla_escolha?.atividade?.licao?.modulo_id ?? null;

      if (turmaId !== null) {
        const agregado = porTurma.get(turmaId) ?? { total: 0, corretas: 0 };
        agregado.total += 1;
        if (correta) agregado.corretas += 1;
        porTurma.set(turmaId, agregado);
      }

      if (moduloId !== null) {
        const agregado = porModulo.get(moduloId) ?? { total: 0, corretas: 0 };
        agregado.total += 1;
        if (correta) agregado.corretas += 1;
        porModulo.set(moduloId, agregado);
      }
    }

    const mediaPorTurma: MediaPorTurma[] = turmas.map((turma) => {
      const agregado = porTurma.get(turma.turma_id);
      return {
        turmaId: turma.turma_id,
        nome: turma.nome_turma,
        media: agregado && agregado.total > 0 ? Math.round((agregado.corretas / agregado.total) * 100) : null,
        totalRespostas: agregado?.total ?? 0,
      };
    });

    const mediaPorModulo: MediaPorModulo[] = modulos.map((modulo) => {
      const agregado = porModulo.get(modulo.modulo_id);
      return {
        moduloId: modulo.modulo_id,
        nome: modulo.titulo_modulo,
        media: agregado && agregado.total > 0 ? Math.round((agregado.corretas / agregado.total) * 100) : null,
        totalRespostas: agregado?.total ?? 0,
      };
    });

    return {
      totalAlunos,
      totalProfessores,
      totalModulos,
      totalLicoes,
      totalAtividadesRespondidas,
      mediaPorTurma,
      mediaPorModulo,
    };
  }
}
