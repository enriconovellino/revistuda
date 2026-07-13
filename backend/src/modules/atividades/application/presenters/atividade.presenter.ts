import { Atividade, MultiplaEscolha, AssociacaoImagens } from '../../domain/entities/atividade.entity';

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export class AtividadePresenter {
  static toPresentation(atividade: Atividade) {
    const isMultiplaEscolha = atividade instanceof MultiplaEscolha;
    const isAssociacaoImagens = atividade instanceof AssociacaoImagens;

    const baseRepresentation: any = {
      atividade_id: atividade.atividade_id,
      titulo_atividade: atividade.titulo_atividade,
      tipo_atividade: atividade.tipo_atividade,
      enunciado: atividade.enunciado || undefined,
      explicacao: atividade.explicacao || undefined,
      licao_id: atividade.licao_id,
      data_criacao: atividade.data_criacao ?? undefined,
      modulo: atividade.modulo ?? undefined,
      status: atividade.status ?? 'a_fazer',
      data_conclusao: atividade.data_conclusao ?? null,
    };

    if (isMultiplaEscolha) {
      baseRepresentation.opcoes = (atividade as MultiplaEscolha).opcoes.map((o) => ({
        opcao_id: o.opcao_id,
        texto_opcao: o.texto_opcao,
        letra: o.letra,
        correta: o.correta,
      }));
    } else if (isAssociacaoImagens) {
      const assoc = atividade as AssociacaoImagens;
      
      const leftItens = assoc.itens.filter(i => i.lado === 'esquerdo').map(i => ({
        item_associacao_id: i.item_associacao_id,
        tipo: i.tipo,
        texto: i.texto,
        imagem_url: i.imagem_url,
      }));

      const rightItens = assoc.itens.filter(i => i.lado === 'direito').map(i => ({
        item_associacao_id: i.item_associacao_id,
        tipo: i.tipo,
        texto: i.texto,
        imagem_url: i.imagem_url,
      }));

      baseRepresentation.itens_esquerdos = shuffle(leftItens);
      baseRepresentation.itens_direitos = shuffle(rightItens);
      baseRepresentation.relacoes_corretas = assoc.associacoes_corretas.map(ac => ({
        item_1_id: ac.item_1_id,
        item_2_id: ac.item_2_id,
      }));
    }

    return baseRepresentation;
  }

  static toCollection(atividades: Atividade[]) {
    return atividades.map((atividade) => this.toPresentation(atividade));
  }
}
