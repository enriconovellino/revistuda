import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';

@Injectable()
export class ConcluirConteudoUseCase {
  constructor(
    @Inject(CONTEUDO_REPOSITORY)
    private conteudoRepository: IConteudoRepository,
  ) {}

  async execute(
    alunoId: number,
    conteudoId: number,
  ): Promise<{ conteudo_id: number; data_conclusao: Date }> {
    const conteudo = await this.conteudoRepository.findById(conteudoId);
    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    return this.conteudoRepository.concluirConteudo(alunoId, conteudoId);
  }
}
