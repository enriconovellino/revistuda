import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';
import { Conteudo } from '../entities/conteudo.entity';

export interface UpdateConteudoInput {
  id: number;
  nome_conteudo?: string;
  tipo_conteudo?: string;
  url_conteudo?: string;
  texto_conteudo?: string;
  licao_id?: number;
}

@Injectable()
export class UpdateConteudoUseCase {
  constructor(@Inject(CONTEUDO_REPOSITORY) private conteudoRepository: IConteudoRepository) {}

  async execute(input: UpdateConteudoInput): Promise<Conteudo> {
    const exists = await this.conteudoRepository.findById(input.id);
    if (!exists) throw new NotFoundException('Conteúdo não encontrado');
    return this.conteudoRepository.update(input.id, input);
  }
}