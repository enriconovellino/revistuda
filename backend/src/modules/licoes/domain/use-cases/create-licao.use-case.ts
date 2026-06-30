import { Injectable, Inject } from '@nestjs/common';
import { Licao } from '../entities/licao.entity';
import type { ILicaoRepository } from '../ports/licao-repository.port';
import { LICAO_REPOSITORY } from '../ports/licao-repository.port';

export interface CreateLicaoInput {
  titulo_licao: string;
  comentario?: string;
  modulo_id: number;
}

@Injectable()
export class CreateLicaoUseCase {
  constructor(@Inject(LICAO_REPOSITORY) private repository: ILicaoRepository) {}

  async execute(input: CreateLicaoInput): Promise<Licao> {
    const licao = new Licao(0, input.titulo_licao, input.modulo_id, input.comentario);
    return this.repository.create(licao);
  }
}
