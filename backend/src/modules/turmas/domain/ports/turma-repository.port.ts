import { Turma } from '../entities/turma.entity';

export interface ITurmaRepository {
  create(turma: Turma): Promise<Turma>;
  findAll(): Promise<Turma[]>;
  findById(id: number): Promise<Turma | null>;
  update(id: number, turma: Partial<Turma>): Promise<Turma>;
  delete(id: number): Promise<void>;
}

export const TURMA_REPOSITORY = 'TURMA_REPOSITORY';