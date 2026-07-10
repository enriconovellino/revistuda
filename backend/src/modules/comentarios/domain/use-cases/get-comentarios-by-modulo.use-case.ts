import { Inject, Injectable } from '@nestjs/common';
import { COMENTARIO_REPOSITORY } from '../ports/comentario-repository.port';
import type { IComentarioRepository, ComentarioComAluno } from '../ports/comentario-repository.port';

@Injectable()
export class GetComentariosByModuloUseCase {
  constructor(
    @Inject(COMENTARIO_REPOSITORY) private comentarioRepository: IComentarioRepository,
  ) {}

  async execute(moduloId: number): Promise<ComentarioComAluno[]> {
    return this.comentarioRepository.findByModulo(moduloId);
  }
}