export interface Modulo {
  modulo_id: number;
  titulo_modulo: string;
  descricao_modulo?: string;
  dificuldade: string;
}

export interface Licao {
  licao_id: number;
  titulo_licao: string;
  comentario?: string;
  modulo_id: number;
}

export interface Atividade {
  atividade_id: number;
  titulo_atividade: string;
  descricao_atividade?: string;
  tipo_atividade: string;
  licao_id: number;
}

export interface DashboardData {
  modulos: Modulo[];
  licoes: Licao[];
  atividades: Atividade[];
}
