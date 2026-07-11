import { Atividade, RespostaMultiplaEscolha } from '../entities/atividade.entity';

export interface ProgressoAtividadeInfo {
  status: 'a_fazer' | 'fazendo' | 'feito';
  data_inicio: Date | null;
  data_conclusao: Date | null;
}

export interface IAtividadeRepository {
  create(atividade: Atividade): Promise<Atividade>;
  findAll(userId?: number): Promise<Atividade[]>;
  findById(id: number): Promise<Atividade | null>;
  update(id: number, atividade: Partial<Atividade>): Promise<Atividade>;
  delete(id: number): Promise<void>;
  saveRespostaMultiplaEscolha(alunoId: number, opcaoId: number): Promise<RespostaMultiplaEscolha>;
  saveRespostaAssociacao(
    alunoId: number,
    atividadeId: number,
    respostas: { item_1_id: number; item_2_id: number }[],
  ): Promise<any>;
  iniciarProgresso(alunoId: number, atividadeId: number): Promise<ProgressoAtividadeInfo>;
  marcarFeito(alunoId: number, atividadeId: number): Promise<ProgressoAtividadeInfo>;
}

export const ATIVIDADE_REPOSITORY = 'ATIVIDADE_REPOSITORY';
