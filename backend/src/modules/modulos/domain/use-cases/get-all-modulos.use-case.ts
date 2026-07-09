import { Inject, Injectable } from '@nestjs/common';
import type { IModuloRepository } from '../ports/modulo-repository.port';
import { MODULO_REPOSITORY } from '../ports/modulo-repository.port';
import { Modulo } from '../entities/modulo.entity';

@Injectable()
export class GetAllModulosUseCase {
  constructor(@Inject(MODULO_REPOSITORY) private moduloRepository: IModuloRepository) {}

  async execute(userId?: number): Promise<Modulo[]> {
    return this.moduloRepository.findAll(userId);
  }
}