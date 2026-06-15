import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TURMA_REPOSITORY } from '../ports/turma-repository.port';
import type { ITurmaRepository } from '../ports/turma-repository.port';
import { Turma } from '../entities/turma.entity';

@Injectable()
export class GetTurmaUseCase {
  constructor(@Inject(TURMA_REPOSITORY) private turmaRepository: ITurmaRepository) {}

  async execute(id: number): Promise<Turma> {
    const turma = await this.turmaRepository.findById(id);
    if (!turma) throw new NotFoundException('Turma não encontrada');
    return turma;
  }
}