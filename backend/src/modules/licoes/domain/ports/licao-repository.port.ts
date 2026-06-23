import { Licao } from '../entities/licao.entity';

export interface ILicaoRepository {
  create(licao: Licao): Promise<Licao>;
  findAll(): Promise<Licao[]>;
  findById(id: number): Promise<Licao | null>;
  update(id: number, licao: Partial<Licao>): Promise<Licao>;
  delete(id: number): Promise<void>;
}

export const LICAO_REPOSITORY = 'LICAO_REPOSITORY';
