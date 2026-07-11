import { Comentario } from '../entities/comentario.entity';
export interface ComentarioComAluno extends Comentario {
  aluno: {
    id: number;
    nome: string;
  };
  conteudo: {
    conteudo_id: number;
    nome_conteudo: string;
    licao_id: number;
  };
}
export interface ComentarioResumo {
  id: number;
  texto: string;
  createdAt: Date;
  updatedAt: Date;
  aluno: { id: number; nome: string };
  conteudo: { conteudo_id: number; nome_conteudo: string };
  licao: { licao_id: number; titulo_licao: string };
  modulo: { modulo_id: number; titulo_modulo: string };
  turma: { turma_id: number; nome_turma: string };
}

export interface IComentarioRepository {
  upsert(alunoId: number, conteudoId: number, texto: string): Promise<Comentario>;
  findByAlunoAndConteudo(alunoId: number, conteudoId: number): Promise<Comentario | null>;
  findByConteudo(conteudoId: number): Promise<ComentarioComAluno[]>;
  findByModulo(moduloId: number): Promise<ComentarioComAluno[]>;
  findByProfessor(professorId: number): Promise<ComentarioResumo[]>;
  responder(id: number, resposta: string): Promise<Comentario>;
}

export const COMENTARIO_REPOSITORY = 'COMENTARIO_REPOSITORY';