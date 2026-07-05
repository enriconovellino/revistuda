import { Conteudo } from '../../domain/entities/conteudo.entity';

export class ConteudoPresenter {
  conteudo_id!: number;
  nome_conteudo!: string;
  tipo_conteudo!: string;
  url_conteudo?: string;
  texto_conteudo?: string;
  licao_id!: number;

  static toPresentation(conteudo: Conteudo): ConteudoPresenter {
    const presenter = new ConteudoPresenter();
    presenter.conteudo_id = conteudo.conteudo_id;
    presenter.nome_conteudo = conteudo.nome_conteudo;
    presenter.tipo_conteudo = conteudo.tipo_conteudo;
    presenter.url_conteudo = conteudo.url_conteudo;
    presenter.texto_conteudo = conteudo.texto_conteudo;
    presenter.licao_id = conteudo.licao_id;
    return presenter;
  }

  static toCollection(conteudos: Conteudo[]): ConteudoPresenter[] {
    return conteudos.map((c) => this.toPresentation(c));
  }
}