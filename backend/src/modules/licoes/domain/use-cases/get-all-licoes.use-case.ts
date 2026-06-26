import { Injectable, Inject } from '@nestjs/common';
import { Licao } from '../entities/licao.entity';
import type { ILicaoRepository } from '../ports/licao-repository.port';
import { LICAO_REPOSITORY } from '../ports/licao-repository.port';

@Injectable()
export class GetAllLicoes {
  constructor(@Inject(LICAO_REPOSITORY) private repository: ILicaoRepository) {}

  async execute(): Promise<Licao[]> {
    return this.repository.findAll();
  }
}
