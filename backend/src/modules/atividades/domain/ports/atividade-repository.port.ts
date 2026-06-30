import { Atividade } from '../entities/atividade.entity';

export interface IAtividadeRepository {
    create(atividade: Atividade): Promise<Atividade>;
    findAll(): Promise<Atividade[]>;
    findById(id: number): Promise<Atividade | null>;
    update(id: number, atividade: Partial<Atividade>): Promise<Atividade>;
    delete(id: number): Promise<void>;
}

export const ATIVIDADE_REPOSITORY = 'ATIVIDADE_REPOSITORY';