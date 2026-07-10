import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface DesempenhoMensal {
  mes: string; 
  acertos: number;
  erros: number;
}

@Injectable()
export class GetDesempenhoMensalUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(professorId: number): Promise<DesempenhoMensal[]> {
    const turmas = await this.prisma.turma.findMany({
      where: { professor_id: professorId },
      select: { turma_id: true },
    });
    const turmaIds = turmas.map((t) => t.turma_id);

    const respostas = await this.prisma.respostaMultiplaEscolha.findMany({
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
        data_resposta: true,
        opcao: { select: { correta: true } },
      },
    });

    const mapa = new Map<string, { acertos: number; erros: number }>();

    respostas.forEach((r) => {
      const data = r.data_resposta;
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const atual = mapa.get(mes) || { acertos: 0, erros: 0 };
      if (r.opcao.correta) {
        atual.acertos++;
      } else {
        atual.erros++;
      }
      mapa.set(mes, atual);
    });

    return Array.from(mapa.entries())
      .map(([mes, valores]) => ({ mes, ...valores }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }
}