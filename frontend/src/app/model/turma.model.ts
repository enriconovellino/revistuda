export interface Turma {
    turma_id: number;
    nome_turma: string;
    descricao_turma?: string;
    capacidade_maxima?: number | null;
    professor_id?: number | null;
    totalAlunos?: number;
}