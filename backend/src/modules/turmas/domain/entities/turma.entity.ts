export class Turma {
  turma_id!: number;
  nome_turma!: string;
  descricao_turma?: string;
  capacidade_maxima?: number;

  constructor(
    turma_id: number,
    nome_turma: string,
    descricao_turma?: string,
    capacidade_maxima?: number,
  ) {
    this.turma_id = turma_id;
    this.nome_turma = nome_turma;
    this.descricao_turma = descricao_turma;
    this.capacidade_maxima = capacidade_maxima;
  }
}
