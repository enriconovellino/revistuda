import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Licao } from '../entities/licao.entity';
import type { ILicaoRepository } from '../ports/licao-repository.port';
import { LICAO_REPOSITORY } from '../ports/licao-repository.port';

@Injectable()
export class GetLicaoUseCase {
  constructor(@Inject(LICAO_REPOSITORY) private repository: ILicaoRepository) {}

  async execute(id: number): Promise<Licao> {
    const licao = await this.repository.findById(id);
    if (!licao) {
      throw new NotFoundException(`Licão com ID ${id} não encontrada`);
    }
    return licao;
  }
}
