import { Atividade } from '../../domain/entities/atividade.entity';

export class AtividadePresenter {
  static toPresentation(atividade: Atividade) {
    return {
      atividade_id: atividade.atividade_id,
      titulo_atividade: atividade.titulo_atividade,
      tipo_atividade: atividade.tipo_atividade,
      enunciado: atividade.enunciado || undefined,
      opcoes: atividade.opcoes ? atividade.opcoes.map(o => ({
        opcao_id: o.opcao_id,
        texto_opcao: o.texto_opcao,
        letra: o.letra,
        correta: o.correta
      })) : [],
      licao_id: atividade.licao_id,
    };
  }

  static toCollection(atividades: Atividade[]) {
    return atividades.map((atividade) => this.toPresentation(atividade));
  }
}
