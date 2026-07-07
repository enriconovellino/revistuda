export class Opcao {
  opcao_id: number;
  texto_opcao: string;
  letra: string;
  correta: boolean;
  atividade_id: number;

  constructor(
    opcao_id: number,
    texto_opcao: string,
    letra: string,
    correta: boolean,
    atividade_id: number,
  ) {
    this.opcao_id = opcao_id;
    this.texto_opcao = texto_opcao;
    this.letra = letra;
    this.correta = correta;
    this.atividade_id = atividade_id;
  }
}

export class Atividade {
  atividade_id: number;
  titulo_atividade: string;
  tipo_atividade: string;
  enunciado: string | null;
  opcoes: Opcao[];
  licao_id: number;

  constructor(
    atividade_id: number,
    titulo_atividade: string,
    tipo_atividade: string,
    licao_id: number,
    enunciado: string | null = null,
    opcoes: Opcao[] = [],
  ) {
    this.atividade_id = atividade_id;
    this.titulo_atividade = titulo_atividade;
    this.tipo_atividade = tipo_atividade;
    this.enunciado = enunciado;
    this.opcoes = opcoes;
    this.licao_id = licao_id;
  }
}
