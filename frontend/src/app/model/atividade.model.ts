export interface OpcaoAtividade {
  opcao_id?: number;
  texto_opcao: string;
  letra: string;
  correta: boolean;
}

export interface ItemPar {
  tipo: 'texto' | 'imagem';
  texto?: string;
  imagem_url?: string;
  uploading?: boolean;
}

export interface ParAssociacao {
  esquerdo: ItemPar;
  direito: ItemPar;
}

export interface ItemAssociacao {
  item_associacao_id: number;
  tipo: 'texto' | 'imagem';
  texto?: string;
  imagem_url?: string;
  uploading?: boolean;
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
  pares_associacao?: ParAssociacao[];
  itens_esquerdos?: ItemAssociacao[];
  itens_direitos?: ItemAssociacao[];
  relacoes_corretas?: RelacaoCorreta[];
  licao_id: number;
}

export interface MultiplaEscolha extends Atividade {
  tipo_atividade: 'multipla_escolha';
  opcoes: OpcaoAtividade[];
}

export interface AssociacaoImagens extends Atividade {
  tipo_atividade: 'associacao_imagens';
  pares_associacao?: ParAssociacao[];
  itens_esquerdos?: ItemAssociacao[];
  itens_direitos?: ItemAssociacao[];
  relacoes_corretas?: RelacaoCorreta[];
}
