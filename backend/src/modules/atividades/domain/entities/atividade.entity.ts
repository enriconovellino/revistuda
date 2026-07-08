export class Opcao {
  opcao_id: number;
  texto_opcao: string;
  letra: string;
  correta: boolean;
  multipla_escolha_id: number;

  constructor(
    opcao_id: number,
    texto_opcao: string,
    letra: string,
    correta: boolean,
    multipla_escolha_id: number,
  ) {
    this.opcao_id = opcao_id;
    this.texto_opcao = texto_opcao;
    this.letra = letra;
    this.correta = correta;
    this.multipla_escolha_id = multipla_escolha_id;
  }
}

export class Atividade {
  atividade_id: number;
  titulo_atividade: string;
  tipo_atividade: string;
  enunciado: string | null;
  licao_id: number;

  constructor(
    atividade_id: number,
    titulo_atividade: string,
    tipo_atividade: string,
    licao_id: number,
    enunciado: string | null = null,
  ) {
    this.atividade_id = atividade_id;
    this.titulo_atividade = titulo_atividade;
    this.tipo_atividade = tipo_atividade;
    this.enunciado = enunciado;
    this.licao_id = licao_id;
  }
}

export class MultiplaEscolha extends Atividade {
  opcoes: Opcao[];

  constructor(
    atividade_id: number,
    titulo_atividade: string,
    licao_id: number,
    enunciado: string | null = null,
    opcoes: Opcao[] = [],
  ) {
    super(atividade_id, titulo_atividade, 'multipla_escolha', licao_id, enunciado);
    this.opcoes = opcoes;
  }
}

export class AssociacaoImagens extends Atividade {
  constructor(
    atividade_id: number,
    titulo_atividade: string,
    licao_id: number,
    enunciado: string | null = null,
  ) {
    super(atividade_id, titulo_atividade, 'associacao_imagens', licao_id, enunciado);
  }
}
