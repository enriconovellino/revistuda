import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ILicaoRepository } from '../ports/licao-repository.port';
import { LICAO_REPOSITORY } from '../ports/licao-repository.port';

@Injectable()
export class DeleteLicaoUseCase {
  constructor(@Inject(LICAO_REPOSITORY) private repository: ILicaoRepository) {}

  async execute(id: number): Promise<void> {
    const licao = await this.repository.findById(id);
    if (!licao) {
      throw new NotFoundException(`Licão com ID ${id} não encontrada`);
    }
    await this.repository.delete(id);
  }
}
