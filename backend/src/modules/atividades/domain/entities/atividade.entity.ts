export interface MultiplaEscolhaDados {
  enunciado: string;
  opcoes: { id: string; texto: string }[];
  resposta_correta: string;
}

export class Atividade {
  atividade_id: number;
  titulo_atividade: string;
  descricao_atividade: string | null;
  tipo_atividade: string;
  dados_atividade: MultiplaEscolhaDados | null;
  licao_id: number;

  constructor(
    atividade_id: number,
    titulo_atividade: string,
    descricao_atividade: string | null,
    tipo_atividade: string,
    licao_id: number,
    dados_atividade: MultiplaEscolhaDados | null = null,
  ) {
    this.atividade_id = atividade_id;
    this.titulo_atividade = titulo_atividade;
    this.descricao_atividade = descricao_atividade;
    this.tipo_atividade = tipo_atividade;
    this.dados_atividade = dados_atividade;
    this.licao_id = licao_id;
  }
}
