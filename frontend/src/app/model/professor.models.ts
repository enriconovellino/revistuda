export interface Modulo {
  modulo_id: number;
  titulo_modulo: string;
  descricao_modulo?: string;
  dificuldade: string;
  imagem_url?: string;
  turma_id?: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  permissions: string[];
}

export interface Turma {
  turma_id: number;
  nome_turma: string;
  descricao_turma?: string;
  capacidade_maxima?: number | null;
  professor_id?: number | null;
  total_alunos?: number;
}

export interface Licao {
  licao_id: number;
  titulo_licao: string;
  comentario?: string;
  modulo_id: number;
}

export interface Conteudo {
  conteudo_id: number;
  nome_conteudo: string;
  tipo_conteudo: string;
  url_conteudo?: string | null;
  texto_conteudo?: string | null;
  licao_id: number;
  safeUrl?: any;
}

export interface OpcaoAtividade {
  opcao_id?: number;
  texto_opcao: string;
  letra: 'a' | 'b' | 'c' | 'd';
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

export interface Atividade {
  atividade_id: number;
  titulo_atividade: string;
  tipo_atividade: string;
  enunciado?: string | null;
  opcoes?: OpcaoAtividade[];
  pares_associacao?: ParAssociacao[];
  itens_esquerdos?: ItemAssociacao[];
  itens_direitos?: ItemAssociacao[];
  relacoes_corretas?: { item_1_id: number, item_2_id: number }[];
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
  relacoes_corretas?: { item_1_id: number, item_2_id: number }[];
}
export interface ComentarioAlunoProfessor {
  id: number;
  texto: string;
  alunoId: number;
  conteudoId: number;
  createdAt: string;
  updatedAt: string;
  aluno: { id: number; nome: string };
  conteudo: { conteudo_id: number; nome_conteudo: string; licao_id: number };
}

export interface ComentarioResumoProfessor {
  id: number;
  texto: string;
  createdAt: string;
  updatedAt: string;
  resposta?: string | null;
  respostaAt?: string | null;
  aluno: { id: number; nome: string };
  conteudo: { conteudo_id: number; nome_conteudo: string };
  licao: { licao_id: number; titulo_licao: string };
  modulo: { modulo_id: number; titulo_modulo: string };
  turma: { turma_id: number; nome_turma: string };
}
export interface EstatisticasProfessor {
  totalTurmas: number;
  totalAlunos: number;
  totalRespostas: number;
  acertos: number;
  erros: number;
  naoRespondeu: number;
}
export interface DesempenhoMensal {
  mes: string;
  acertos: number;
  erros: number;
}