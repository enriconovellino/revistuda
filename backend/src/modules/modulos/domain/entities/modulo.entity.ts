export class Modulo {
  modulo_id!: number;
  titulo_modulo!: string;
  descricao_modulo?: string;
  dificuldade!: string;
  imagem_url?: string;
  turma_id!: number;

  constructor(
    modulo_id: number,
    titulo_modulo: string,
    dificuldade: string,
    turma_id: number,
    descricao_modulo?: string,
    imagem_url?: string,
  ) {
    this.modulo_id = modulo_id;
    this.titulo_modulo = titulo_modulo;
    this.dificuldade = dificuldade;
    this.turma_id = turma_id;
    this.descricao_modulo = descricao_modulo;
    this.imagem_url = imagem_url;
  }
}