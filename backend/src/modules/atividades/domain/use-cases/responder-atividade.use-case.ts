import { Inject, Injectable } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { RespostaMultiplaEscolha } from '../entities/atividade.entity';

@Injectable()
export class ResponderAtividadeUseCase {
  constructor(
    @Inject(ATIVIDADE_REPOSITORY)
    private atividadeRepository: IAtividadeRepository,
  ) {}

  async execute(
    alunoId: number,
    atividadeId: number,
    opcaoId: number,
  ): Promise<RespostaMultiplaEscolha> {
    const resposta = await this.atividadeRepository.saveRespostaMultiplaEscolha(alunoId, opcaoId);
    await this.atividadeRepository.marcarFeito(alunoId, atividadeId);
    return resposta;
  }

  async executeAssociacao(
    alunoId: number,
    atividadeId: number,
    respostas: { item_1_id: number; item_2_id: number }[],
  ): Promise<any> {
    const resposta = await this.atividadeRepository.saveRespostaAssociacao(
      alunoId,
      atividadeId,
      respostas,
    );
    await this.atividadeRepository.marcarFeito(alunoId, atividadeId);
    return resposta;
  }
}
