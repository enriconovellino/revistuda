import { Turma } from '../../domain/entities/turma.entity';

export class TurmaPresenter {
  turma_id!: number;
  nome_turma!: string;
  descricao_turma?: string;
  capacidade_maxima?: number;
  professor_id!: number;

  static toPresentation(turma: Turma): TurmaPresenter {
    const presenter = new TurmaPresenter();
    presenter.turma_id = turma.turma_id;
    presenter.nome_turma = turma.nome_turma;
    presenter.descricao_turma = turma.descricao_turma;
    presenter.capacidade_maxima = turma.capacidade_maxima;
    presenter.professor_id = turma.professor_id;
    return presenter;
  }

  static toCollection(turmas: Turma[]): TurmaPresenter[] {
    return turmas.map((t) => this.toPresentation(t));
  }
}