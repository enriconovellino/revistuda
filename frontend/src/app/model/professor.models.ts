// Limite global de alunos por turma — espelha MAX_ALUNOS_POR_TURMA do backend.
export const MAX_ALUNOS_POR_TURMA = 10;

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  permissions: string[];
  approved?: boolean;
  rejected?: boolean;
  turmaId?: number | null;
}

export interface ComentarioAlunoProfessor {
  id: number;
  texto: string;
  alunoId: number;
  conteudoId: number;
  createdAt: string;
  updatedAt: string;
  resposta?: string | null;
  respostaAt?: string | null;
  aluno: { id: number; nome: string };
  conteudo: { conteudo_id: number; nome_conteudo: string; licao_id: number };
}

export interface ComentarioResumoProfessor {
  id: number;
  texto: string;
  createdAt: string;
  updatedAt: string;
  resposta?: string | null;
  respostaAt?: string | null;
  aluno: { id: number; nome: string };
  conteudo: { conteudo_id: number; nome_conteudo: string };
  licao: { licao_id: number; titulo_licao: string };
  modulo: { modulo_id: number; titulo_modulo: string };
  turma: { turma_id: number; nome_turma: string };
}
export interface EstatisticasProfessor {
  totalTurmas: number;
  totalAlunos: number;
  totalRespostas: number;
  acertos: number;
  erros: number;
  naoRespondeu: number;
}
export interface DesempenhoMensal {
  mes: string;
  acertos: number;
  erros: number;
}

export interface DesempenhoAluno {
  acertos: number;
  erros: number;
  totalRespostas: number;
  taxaAcerto: number;
}

export interface AlunoProfessor {
  aluno_id: number;
  nome: string;
  email: string;
  turma_id: number;
  nome_turma: string;
  desempenho: DesempenhoAluno;
}
