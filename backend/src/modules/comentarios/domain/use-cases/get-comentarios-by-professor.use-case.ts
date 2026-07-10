import { Inject, Injectable } from '@nestjs/common';
import { COMENTARIO_REPOSITORY } from '../ports/comentario-repository.port';
import type { IComentarioRepository, ComentarioResumo } from '../ports/comentario-repository.port';

@Injectable()
export class GetComentariosByProfessorUseCase {
  constructor(
    @Inject(COMENTARIO_REPOSITORY) private comentarioRepository: IComentarioRepository,
  ) {}

  async execute(professorId: number): Promise<ComentarioResumo[]> {
    return this.comentarioRepository.findByProfessor(professorId);
  }
}