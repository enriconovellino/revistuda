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
