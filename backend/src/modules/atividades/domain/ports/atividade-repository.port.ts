import { Atividade, RespostaMultiplaEscolha } from '../entities/atividade.entity';

export interface IAtividadeRepository {
    create(atividade: Atividade): Promise<Atividade>;
    findAll(): Promise<Atividade[]>;
    findById(id: number): Promise<Atividade | null>;
    update(id: number, atividade: Partial<Atividade>): Promise<Atividade>;
    delete(id: number): Promise<void>;
    saveRespostaMultiplaEscolha(alunoId: number, opcaoId: number): Promise<RespostaMultiplaEscolha>;
}

export const ATIVIDADE_REPOSITORY = 'ATIVIDADE_REPOSITORY';