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