import { Inject, Injectable } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { Atividade, MultiplaEscolhaDados } from '../entities/atividade.entity';

export interface CreateAtividadeInput {
  titulo_atividade: string;
  descricao_atividade: string | null;
  tipo_atividade: string;
  dados_atividade: MultiplaEscolhaDados | null;
  licao_id: number;
}

@Injectable()
export class CreateAtividadeUseCase {
  constructor(
    @Inject(ATIVIDADE_REPOSITORY)
    private atividadeRepository: IAtividadeRepository,
  ) {}

  async execute(input: CreateAtividadeInput): Promise<Atividade> {
    const atividade = new Atividade(
      0,
      input.titulo_atividade,
      input.descricao_atividade,
      input.tipo_atividade,
      input.licao_id,
      input.dados_atividade,
    );

    return this.atividadeRepository.create(atividade);
  }
}
