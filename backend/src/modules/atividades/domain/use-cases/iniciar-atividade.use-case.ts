import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository, ProgressoAtividadeInfo } from '../ports/atividade-repository.port';

@Injectable()
export class IniciarAtividadeUseCase {
  constructor(
    @Inject(ATIVIDADE_REPOSITORY)
    private atividadeRepository: IAtividadeRepository,
  ) {}

  async execute(alunoId: number, atividadeId: number): Promise<ProgressoAtividadeInfo> {
    const atividade = await this.atividadeRepository.findById(atividadeId);
    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }
    return this.atividadeRepository.iniciarProgresso(alunoId, atividadeId);
  }
}
