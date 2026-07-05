export class Conteudo {
  conteudo_id!: number;
  nome_conteudo!: string;
  tipo_conteudo!: string;
  url_conteudo?: string;
  texto_conteudo?: string;
  licao_id!: number;

  constructor(
    conteudo_id: number,
    nome_conteudo: string,
    tipo_conteudo: string,
    licao_id: number,
    url_conteudo?: string,
    texto_conteudo?: string,
  ){
    this.conteudo_id = conteudo_id;
    this.nome_conteudo = nome_conteudo;
    this.tipo_conteudo = tipo_conteudo;
    this.licao_id = licao_id;
    this.url_conteudo = url_conteudo;
    this.texto_conteudo = texto_conteudo;
  }
}
