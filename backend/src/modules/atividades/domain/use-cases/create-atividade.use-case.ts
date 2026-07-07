import { Inject, Injectable } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { Atividade, Opcao } from '../entities/atividade.entity';

export interface CreateAtividadeInput {
  titulo_atividade: string;
  tipo_atividade: string;
  enunciado: string | null;
  licao_id: number;
  opcoes?: { texto_opcao: string; letra: string; correta: boolean }[];
}

@Injectable()
export class CreateAtividadeUseCase {
  constructor(
    @Inject(ATIVIDADE_REPOSITORY)
    private atividadeRepository: IAtividadeRepository,
  ) {}

  async execute(input: CreateAtividadeInput): Promise<Atividade> {
    const opcoes = (input.opcoes ?? []).map(o => new Opcao(
      0,
      o.texto_opcao,
      o.letra,
      o.correta,
      0
    ));

    const atividade = new Atividade(
      0,
      input.titulo_atividade,
      input.tipo_atividade,
      input.licao_id,
      input.enunciado,
      opcoes,
    );

    return this.atividadeRepository.create(atividade);
  }
}
