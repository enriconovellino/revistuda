import { Inject, Injectable } from '@nestjs/common';
import { COMENTARIO_REPOSITORY } from '../ports/comentario-repository.port';
import type { IComentarioRepository } from '../ports/comentario-repository.port';
import { Comentario } from '../entities/comentario.entity';
 
export interface SaveComentarioInput {
  alunoId: number;
  conteudoId: number;
  texto: string;
}
 
@Injectable()
export class SaveComentarioUseCase {
  constructor(
    @Inject(COMENTARIO_REPOSITORY) private comentarioRepository: IComentarioRepository,
  ) {}
 
  async execute(input: SaveComentarioInput): Promise<Comentario> {
    return this.comentarioRepository.upsert(input.alunoId, input.conteudoId, input.texto);
  }
}
 