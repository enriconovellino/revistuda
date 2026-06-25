import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MODULO_REPOSITORY } from '../ports/modulo-repository.port';
import type { IModuloRepository } from '../ports/modulo-repository.port';
import { Modulo } from '../entities/modulo.entity';

@Injectable()
export class GetModuloUseCase {
  constructor(@Inject(MODULO_REPOSITORY) private moduloRepository: IModuloRepository) {}

  async execute(id: number): Promise<Modulo> {
    const modulo = await this.moduloRepository.findById(id);
    if (!modulo) throw new NotFoundException('Módulo não encontrado');
    return modulo;
  }
}