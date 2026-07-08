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

export interface Atividade {
  atividade_id: number;
  titulo_atividade: string;
  tipo_atividade: string;
  enunciado?: string | null;
  opcoes?: OpcaoAtividade[];
  licao_id: number;
}

export interface MultiplaEscolha extends Atividade {
  tipo_atividade: 'multipla_escolha';
  opcoes: OpcaoAtividade[];
}

export interface AssociacaoImagens extends Atividade {
  tipo_atividade: 'associacao_imagens';
}