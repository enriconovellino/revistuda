import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IModuloRepository } from '../ports/modulo-repository.port';
import { MODULO_REPOSITORY } from '../ports/modulo-repository.port';
import { Modulo } from '../entities/modulo.entity';

export interface UpdateModuloInput {
  id: number;
  titulo_modulo?: string;
  descricao_modulo?: string;
  dificuldade?: string;
  turma_id?: number;
  imagem_url?: string;
}

@Injectable()
export class UpdateModuloUseCase {
  constructor(@Inject(MODULO_REPOSITORY) private moduloRepository: IModuloRepository) {}

  async execute(input: UpdateModuloInput): Promise<Modulo> {
    const exists = await this.moduloRepository.findById(input.id);
    if (!exists) throw new NotFoundException('Módulo não encontrado');
    return this.moduloRepository.update(input.id, input);
  }
}