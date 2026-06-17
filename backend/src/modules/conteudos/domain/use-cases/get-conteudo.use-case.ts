import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';
import { Conteudo } from '../entities/conteudo.entity';

@Injectable()
export class GetConteudoUseCase {
  constructor(@Inject(CONTEUDO_REPOSITORY) private conteudoRepository: IConteudoRepository) {}

  async execute(id: number): Promise<Conteudo> {
    const conteudo = await this.conteudoRepository.findById(id);
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    return conteudo;
  }
}