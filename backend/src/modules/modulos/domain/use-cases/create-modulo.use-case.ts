import { Inject, Injectable } from '@nestjs/common';
import { MODULO_REPOSITORY } from '../ports/modulo-repository.port';
import type { IModuloRepository } from '../ports/modulo-repository.port';
import { Modulo } from '../entities/modulo.entity';

export interface CreateModuloInput {
  titulo_modulo: string;
  descricao_modulo?: string;
  dificuldade: string;
  turma_id: number;
}

@Injectable()
export class CreateModuloUseCase {
  constructor(@Inject(MODULO_REPOSITORY) private moduloRepository: IModuloRepository) { }

  async execute(input: CreateModuloInput): Promise<Modulo> {
    const modulo = new Modulo(0, input.titulo_modulo, input.dificuldade, input.turma_id, input.descricao_modulo);
    return this.moduloRepository.create(modulo);
  }
}