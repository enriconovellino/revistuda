import { Atividade, MultiplaEscolhaDados } from '../../domain/entities/atividade.entity';

export class AtividadePresenter {
  static toPresentation(atividade: Atividade) {
    return {
      atividade_id: atividade.atividade_id,
      titulo_atividade: atividade.titulo_atividade,
      descricao_atividade: atividade.descricao_atividade || undefined,
      tipo_atividade: atividade.tipo_atividade,
      dados_atividade: atividade.dados_atividade || undefined,
      licao_id: atividade.licao_id,
    };
  }

  static toCollection(atividades: Atividade[]) {
    return atividades.map((atividade) => this.toPresentation(atividade));
  }
}

export type { MultiplaEscolhaDados };
