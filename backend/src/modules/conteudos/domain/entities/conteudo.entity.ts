export class Conteudo {
  conteudo_id!: number;
  nome_conteudo!: string;
  tipo_conteudo!: string;
  video_url?: string;
  audio_link?: string;
  texto_conteudo?: string;
  licao_id!: number;

  constructor(
    conteudo_id: number,
    nome_conteudo: string,
    tipo_conteudo: string,
    licao_id: number,
    video_url?: string,
    audio_link?: string,
    texto_conteudo?: string,
  ){
    this.conteudo_id = conteudo_id;
    this.nome_conteudo = nome_conteudo;
    this.tipo_conteudo = tipo_conteudo;
    this.licao_id = licao_id;
    this.video_url = video_url;
    this.audio_link = audio_link;
    this.texto_conteudo = texto_conteudo;
  }
}
