import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MODULO_REPOSITORY } from '../ports/modulo-repository.port';
import type { IModuloRepository } from '../ports/modulo-repository.port';

@Injectable()
export class DeleteModuloUseCase {
  constructor(@Inject(MODULO_REPOSITORY) private moduloRepository: IModuloRepository) {}

  async execute(id: number): Promise<void> {
    const exists = await this.moduloRepository.findById(id);
    if (!exists) throw new NotFoundException('Módulo não encontrado');
    return this.moduloRepository.delete(id);
  }
}