import { Injectable, Inject } from '@nestjs/common';
import type { IComentarioRepository } from '../ports/comentario-repository.port';
import { COMENTARIO_REPOSITORY } from '../ports/comentario-repository.port';
import { Comentario } from '../entities/comentario.entity';

@Injectable()
export class ResponderComentarioUseCase {
  constructor(
    @Inject(COMENTARIO_REPOSITORY)
    private comentarioRepository: IComentarioRepository,
  ) {}

  async execute(id: number, resposta: string): Promise<Comentario> {
    return this.comentarioRepository.responder(id, resposta);
  }
}