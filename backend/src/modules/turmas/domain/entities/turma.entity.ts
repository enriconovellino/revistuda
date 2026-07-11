export class Turma {
  turma_id!: number;
  nome_turma!: string;
  descricao_turma?: string;
  capacidade_maxima?: number;
  professor_id?: number | null;
  totalAlunos?: number;

  constructor(
    turma_id: number,
    nome_turma: string,
    professor_id?: number | null,
    descricao_turma?: string,
    capacidade_maxima?: number,
    totalAlunos?: number,
  ) {
    this.turma_id = turma_id;
    this.nome_turma = nome_turma;
    this.professor_id = professor_id;
    this.descricao_turma = descricao_turma;
    this.capacidade_maxima = capacidade_maxima;
    this.totalAlunos = totalAlunos;
  }
}