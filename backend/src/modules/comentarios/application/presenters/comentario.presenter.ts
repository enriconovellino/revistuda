import { Comentario } from '../../domain/entities/comentario.entity';
import { ComentarioComAluno, ComentarioResumo } from '../../domain/ports/comentario-repository.port';

export class ComentarioPresenter {
  id!: number;
  texto!: string;
  alunoId!: number;
  conteudoId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static toPresentation(comentario: Comentario): ComentarioPresenter {
    const presenter = new ComentarioPresenter();
    presenter.id = comentario.id;
    presenter.texto = comentario.texto;
    presenter.alunoId = comentario.alunoId;
    presenter.conteudoId = comentario.conteudoId;
    presenter.createdAt = comentario.createdAt;
    presenter.updatedAt = comentario.updatedAt;
    return presenter;
  }
}

export class ComentarioComAlunoPresenter {
  id!: number;
  texto!: string;
  createdAt!: Date;
  updatedAt!: Date;
  resposta!: string | null;
  respostaAt!: Date | null;
  aluno!: { id: number; nome: string };
  conteudo!: { conteudo_id: number; nome_conteudo: string; licao_id: number };

  static toPresentation(comentario: ComentarioComAluno): ComentarioComAlunoPresenter {
    const presenter = new ComentarioComAlunoPresenter();
    presenter.id = comentario.id;
    presenter.texto = comentario.texto;
    presenter.createdAt = comentario.createdAt;
    presenter.updatedAt = comentario.updatedAt;
    presenter.resposta = comentario.resposta ?? null;
    presenter.respostaAt = comentario.respostaAt ?? null;
    presenter.aluno = comentario.aluno;
    presenter.conteudo = comentario.conteudo;
    return presenter;
  }

  static toCollection(comentarios: ComentarioComAluno[]): ComentarioComAlunoPresenter[] {
    return comentarios.map((c) => ComentarioComAlunoPresenter.toPresentation(c));
  }
}
export class ComentarioResumoPresenter {
  id!: number;
  texto!: string;
  createdAt!: Date;
  updatedAt!: Date;
  aluno!: { id: number; nome: string };
  conteudo!: { conteudo_id: number; nome_conteudo: string };
  licao!: { licao_id: number; titulo_licao: string };
  modulo!: { modulo_id: number; titulo_modulo: string };
  turma!: { turma_id: number; nome_turma: string };

  static toPresentation(comentario: ComentarioResumo): ComentarioResumoPresenter {
    const presenter = new ComentarioResumoPresenter();
    presenter.id = comentario.id;
    presenter.texto = comentario.texto;
    presenter.createdAt = comentario.createdAt;
    presenter.updatedAt = comentario.updatedAt;
    presenter.aluno = comentario.aluno;
    presenter.conteudo = comentario.conteudo;
    presenter.licao = comentario.licao;
    presenter.modulo = comentario.modulo;
    presenter.turma = comentario.turma;
    return presenter;
  }

  static toCollection(comentarios: ComentarioResumo[]): ComentarioResumoPresenter[] {
    return comentarios.map((c) => ComentarioResumoPresenter.toPresentation(c));
  }
}