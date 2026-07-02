import { Modulo } from '../entities/modulo.entity';

export interface IModuloRepository {
  create(modulo: Modulo): Promise<Modulo>;
  findAll(): Promise<Modulo[]>;
  findById(id: number): Promise<Modulo | null>;
  update(id: number, modulo: Partial<Modulo>): Promise<Modulo>;
  delete(id: number): Promise<void>;
}

export const MODULO_REPOSITORY = 'MODULO_REPOSITORY';