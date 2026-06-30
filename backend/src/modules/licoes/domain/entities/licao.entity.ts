export class Licao {
  licao_id: number;
  titulo_licao: string;
  comentario?: string;
  modulo_id: number;

  constructor(licao_id: number, titulo_licao: string, modulo_id: number, comentario?: string) {
    this.licao_id = licao_id;
    this.titulo_licao = titulo_licao;
    this.comentario = comentario;
    this.modulo_id = modulo_id;
  }
}
