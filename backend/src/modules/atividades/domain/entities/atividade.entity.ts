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
  data_criacao?: Date;
  modulo?: { modulo_id: number; titulo_modulo: string };
  status?: 'a_fazer' | 'fazendo' | 'feito';
  data_conclusao?: Date | null;

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

export class ItemAssociacao {
  item_associacao_id: number;
  tipo: string;
  texto: string | null;
  imagem_url: string | null;
  lado: string;
  associacao_id: number;

  constructor(
    item_associacao_id: number,
    tipo: string,
    texto: string | null,
    imagem_url: string | null,
    lado: string,
    associacao_id: number,
  ) {
    this.item_associacao_id = item_associacao_id;
    this.tipo = tipo;
    this.texto = texto;
    this.imagem_url = imagem_url;
    this.lado = lado;
    this.associacao_id = associacao_id;
  }
}

export class AssociacaoCorreta {
  item_1_id: number;
  item_2_id: number;

  constructor(item_1_id: number, item_2_id: number) {
    this.item_1_id = item_1_id;
    this.item_2_id = item_2_id;
  }
}

export class ItemPar {
  tipo: string;
  texto: string | null;
  imagem_url: string | null;

  constructor(tipo: string, texto: string | null = null, imagem_url: string | null = null) {
    this.tipo = tipo;
    this.texto = texto;
    this.imagem_url = imagem_url;
  }
}

export class ParAssociacao {
  esquerdo: ItemPar;
  direito: ItemPar;

  constructor(esquerdo: ItemPar, direito: ItemPar) {
    this.esquerdo = esquerdo;
    this.direito = direito;
  }
}

export class AssociacaoImagens extends Atividade {
  itens: ItemAssociacao[];
  associacoes_corretas: AssociacaoCorreta[];
  pares?: ParAssociacao[];

  constructor(
    atividade_id: number,
    titulo_atividade: string,
    licao_id: number,
    enunciado: string | null = null,
    itens: ItemAssociacao[] = [],
    associacoes_corretas: AssociacaoCorreta[] = [],
    pares?: ParAssociacao[],
  ) {
    super(atividade_id, titulo_atividade, 'associacao_imagens', licao_id, enunciado);
    this.itens = itens;
    this.associacoes_corretas = associacoes_corretas;
    this.pares = pares;
  }
}

export class RespostaMultiplaEscolha {
  resposta_me_id: number;
  aluno_id: number;
  resposta_aluno_id: number;
  data_resposta: Date;

  constructor(
    resposta_me_id: number,
    aluno_id: number,
    resposta_aluno_id: number,
    data_resposta: Date,
  ) {
    this.resposta_me_id = resposta_me_id;
    this.aluno_id = aluno_id;
    this.resposta_aluno_id = resposta_aluno_id;
    this.data_resposta = data_resposta;
  }
}
