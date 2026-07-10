export interface Modulo {
  modulo_id: number;
  titulo_modulo: string;
  descricao_modulo?: string;
  dificuldade: string;
  imagem_url?: string;
}

export interface Licao {
  licao_id: number;
  titulo_licao: string;
  comentario?: string;
  modulo_id: number;
}

export interface OpcaoAtividade {
  opcao_id: number;
  texto_opcao: string;
  letra: string;
  correta: boolean;
}

export interface ItemAssociacao {
  item_associacao_id: number;
  tipo: 'texto' | 'imagem';
  texto?: string;
  imagem_url?: string;
}

export interface RelacaoCorreta {
  item_1_id: number;
  item_2_id: number;
}

export interface Atividade {
  atividade_id: number;
  titulo_atividade: string;
  descricao_atividade?: string;
  tipo_atividade: string;
  enunciado?: string | null;
  opcoes?: OpcaoAtividade[];
  itens_esquerdos?: ItemAssociacao[];
  itens_direitos?: ItemAssociacao[];
  relacoes_corretas?: RelacaoCorreta[];
  licao_id: number;
}

export interface MultiplaEscolha extends Atividade {
  tipo_atividade: 'multipla_escolha';
}

export interface AssociacaoImagens extends Atividade {
  tipo_atividade: 'associacao_imagens';
}

export interface DashboardData {
  modulos: Modulo[];
  licoes: Licao[];
  atividades: Atividade[];
}
