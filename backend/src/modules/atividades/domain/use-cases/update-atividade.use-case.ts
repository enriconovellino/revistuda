import { Injectable, Inject } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { Atividade, Opcao, MultiplaEscolha, AssociacaoImagens, ItemPar, ParAssociacao } from '../entities/atividade.entity';

export interface UpdateAtividadeInput {
  titulo_atividade?: string;
  tipo_atividade?: string;
  enunciado?: string | null;
  opcoes?: { texto_opcao: string; letra: string; correta: boolean }[];
  pares_associacao?: {
    esquerdo: { tipo: string; texto?: string; imagem_url?: string };
    direito: { tipo: string; texto?: string; imagem_url?: string };
  }[];
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

    const tipo = input.tipo_atividade ?? atividade.tipo_atividade;
    let updatedAtividade: Atividade;

    if (tipo === 'multipla_escolha') {
      const domainOpcoes = input.opcoes ? input.opcoes.map(o => new Opcao(
        0,
        o.texto_opcao,
        o.letra,
        o.correta,
        id
      )) : (atividade instanceof MultiplaEscolha ? atividade.opcoes : []);

      updatedAtividade = new MultiplaEscolha(
        id,
        input.titulo_atividade ?? atividade.titulo_atividade,
        input.licao_id ?? atividade.licao_id,
        input.enunciado !== undefined ? input.enunciado : atividade.enunciado,
        domainOpcoes
      );
    } else if (tipo === 'associacao_imagens') {
      const pares = input.pares_associacao
        ? input.pares_associacao.map(
            p => new ParAssociacao(
              new ItemPar(p.esquerdo.tipo, p.esquerdo.texto, p.esquerdo.imagem_url),
              new ItemPar(p.direito.tipo, p.direito.texto, p.direito.imagem_url)
            )
          )
        : undefined;

      updatedAtividade = new AssociacaoImagens(
        id,
        input.titulo_atividade ?? atividade.titulo_atividade,
        input.licao_id ?? atividade.licao_id,
        input.enunciado !== undefined ? input.enunciado : atividade.enunciado,
        (atividade instanceof AssociacaoImagens ? atividade.itens : []),
        (atividade instanceof AssociacaoImagens ? atividade.associacoes_corretas : []),
        pares
      );
    } else {
      throw new Error(`Tipo de atividade desconhecido: ${tipo}`);
    }

    return this.atividadeRepository.update(id, updatedAtividade);
  }
}
