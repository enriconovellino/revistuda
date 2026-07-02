import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';

@Injectable()
export class DeleteConteudoUseCase {
  constructor(@Inject(CONTEUDO_REPOSITORY) private conteudoRepository: IConteudoRepository) {}

  async execute(id: number): Promise<void> {
    const exists = await this.conteudoRepository.findById(id);
    if (!exists) throw new NotFoundException('Conteúdo não encontrado');
    return this.conteudoRepository.delete(id);
  }
}