import { Conteudo } from '../entities/conteudo.entity';

export interface IConteudoRepository {
  create(conteudo: Conteudo): Promise<Conteudo>;
  findAll(): Promise<Conteudo[]>;
  findById(id: number): Promise<Conteudo | null>;
  update(id: number, conteudo: Partial<Conteudo>): Promise<Conteudo>;
  delete(id: number): Promise<void>;
  concluirConteudo(alunoId: number, conteudoId: number): Promise<{ conteudo_id: number; data_conclusao: Date }>;
  getConteudosConcluidos(alunoId: number, moduloId: number): Promise<number[]>;
}

export const CONTEUDO_REPOSITORY = 'CONTEUDO_REPOSITORY';