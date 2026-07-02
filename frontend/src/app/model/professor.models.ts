export interface Modulo {
  modulo_id: number;
  titulo_modulo: string;
  descricao_modulo?: string;
  dificuldade: string;
  imagem_url?: string; 
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
  capacidade_maxima?: number;
}