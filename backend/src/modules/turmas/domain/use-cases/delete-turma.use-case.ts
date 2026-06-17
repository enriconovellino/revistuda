import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITurmaRepository } from '../ports/turma-repository.port';
import { TURMA_REPOSITORY } from '../ports/turma-repository.port';

@Injectable()
export class DeleteTurmaUseCase {
  constructor(@Inject(TURMA_REPOSITORY) private readonly turmaRepository: ITurmaRepository) {}

  async execute(id: number): Promise<void> {
    const exists = await this.turmaRepository.findById(id);
    if (!exists) throw new NotFoundException('Turma não encontrada');
    return this.turmaRepository.delete(id);
  }
}