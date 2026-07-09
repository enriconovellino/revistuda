import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { RespostaMultiplaEscolha } from '../entities/atividade.entity';

@Injectable()
export class ResponderAtividadeUseCase {
  constructor(
    @Inject(ATIVIDADE_REPOSITORY)
    private atividadeRepository: IAtividadeRepository,
  ) {}

  async execute(alunoId: number, opcaoId: number): Promise<RespostaMultiplaEscolha> {
    try {
      // O repositório lida com a inserção no banco de dados. 
      // O Prisma lançará um erro de constraint caso o aluno_id ou opcao_id não existam.
      return await this.atividadeRepository.saveRespostaMultiplaEscolha(alunoId, opcaoId);
    } catch (error) {
      // Podemos tratar erros específicos de foreign key se necessário,
      // por agora apenas relançamos ou convertemos para NotFoundException se for o caso.
      throw error;
    }
  }
}
