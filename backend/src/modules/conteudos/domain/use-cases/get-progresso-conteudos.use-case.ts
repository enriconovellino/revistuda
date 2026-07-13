import { Inject, Injectable } from '@nestjs/common';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';

@Injectable()
export class GetProgressoConteudosUseCase {
  constructor(
    @Inject(CONTEUDO_REPOSITORY)
    private conteudoRepository: IConteudoRepository,
  ) {}

  async execute(alunoId: number, moduloId: number): Promise<number[]> {
    return this.conteudoRepository.getConteudosConcluidos(alunoId, moduloId);
  }
}
