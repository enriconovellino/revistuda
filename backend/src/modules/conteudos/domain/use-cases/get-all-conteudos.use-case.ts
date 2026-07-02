import { Inject, Injectable } from '@nestjs/common';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';
import type { Conteudo } from '../entities/conteudo.entity';

@Injectable()
export class GetAllConteudosUseCase {
  constructor(@Inject(CONTEUDO_REPOSITORY) private conteudoRepository: IConteudoRepository) {}

  async execute(): Promise<Conteudo[]> {
    return this.conteudoRepository.findAll();
  }
}