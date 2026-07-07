import { Injectable, Inject } from '@nestjs/common';
import { Atividade, Opcao } from '../entities/atividade.entity';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';

export interface UpdateAtividadeInput {
  titulo_atividade?: string;
  tipo_atividade?: string;
  enunciado?: string | null;
  opcoes?: { texto_opcao: string; letra: string; correta: boolean }[];
  licao_id?: number;
}

@Injectable()
export class UpdateAtividadeUseCase {
  constructor(
    @Inject(ATIVIDADE_REPOSITORY)
    private atividadeRepository: IAtividadeRepository,
  ) {}

  async execute(id: number, input: UpdateAtividadeInput): Promise<Atividade> {
    const atividade = await this.atividadeRepository.findById(id);
    if (!atividade) {
      throw new Error(`Atividade com ID ${id} não encontrada`);
    }

    const domainOpcoes = input.opcoes ? input.opcoes.map(o => new Opcao(
      0,
      o.texto_opcao,
      o.letra,
      o.correta,
      id
    )) : undefined;

    const updatedAtividade = new Atividade(
      id,
      input.titulo_atividade ?? atividade.titulo_atividade,
      input.tipo_atividade ?? atividade.tipo_atividade,
      input.licao_id ?? atividade.licao_id,
      input.enunciado !== undefined ? input.enunciado : atividade.enunciado,
      domainOpcoes ?? atividade.opcoes
    );

    return this.atividadeRepository.update(id, updatedAtividade);
  }
}
