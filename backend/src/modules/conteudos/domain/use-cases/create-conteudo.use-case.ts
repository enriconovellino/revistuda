import { Inject, Injectable } from '@nestjs/common';
import type { IConteudoRepository } from '../ports/conteudo-repository.port';
import { CONTEUDO_REPOSITORY } from '../ports/conteudo-repository.port';
import { Conteudo } from '../entities/conteudo.entity';

export interface CreateConteudoInput {
  nome_conteudo: string;
  tipo_conteudo: string;
  licao_id: number;
  url_conteudo?: string;
  texto_conteudo?: string;
}

@Injectable()
export class CreateConteudoUseCase {
  constructor(@Inject(CONTEUDO_REPOSITORY) private conteudoRepository: IConteudoRepository) {}

  async execute(input: CreateConteudoInput): Promise<Conteudo> {
    const conteudo = new Conteudo(
      0,
      input.nome_conteudo,
      input.tipo_conteudo,
      input.licao_id,
      input.url_conteudo,
      input.texto_conteudo,
    );
    return this.conteudoRepository.create(conteudo);
  }
}