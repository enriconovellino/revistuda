import { Inject, Injectable } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { Atividade, Opcao, MultiplaEscolha, AssociacaoImagens } from '../entities/atividade.entity';

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
    let atividade: Atividade;

    if (input.tipo_atividade === 'multipla_escolha') {
      const opcoes = (input.opcoes ?? []).map(o => new Opcao(
        0,
        o.texto_opcao,
        o.letra,
        o.correta,
        0
      ));
      atividade = new MultiplaEscolha(
        0,
        input.titulo_atividade,
        input.licao_id,
        input.enunciado,
        opcoes,
      );
    } else if (input.tipo_atividade === 'associacao_imagens') {
      atividade = new AssociacaoImagens(
        0,
        input.titulo_atividade,
        input.licao_id,
        input.enunciado,
      );
    } else {
      throw new Error(`Tipo de atividade desconhecido: ${input.tipo_atividade}`);
    }

    return this.atividadeRepository.create(atividade);
  }
}
