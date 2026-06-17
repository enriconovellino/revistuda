export class Modulo {
  modulo_id!: number;
  titulo_modulo!: string;
  descricao_modulo?: string;
  dificuldade!: string;

  constructor(
    modulo_id: number,
    titulo_modulo: string,
    dificuldade: string,
    descricao_modulo?: string,
  ) {
    this.modulo_id = modulo_id;
    this.titulo_modulo = titulo_modulo;
    this.dificuldade = dificuldade;
    this.descricao_modulo = descricao_modulo;
  }
}