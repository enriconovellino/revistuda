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
}
