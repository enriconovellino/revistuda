import { Inject, Injectable } from '@nestjs/common';
import type { ITurmaRepository } from '../ports/turma-repository.port';
import { TURMA_REPOSITORY } from '../ports/turma-repository.port';
import { Turma } from '../entities/turma.entity';

@Injectable()
export class GetTurmasByProfessorUseCase {
  constructor(@Inject(TURMA_REPOSITORY) private turmaRepository: ITurmaRepository) {}

  async execute(professorId: number): Promise<Turma[]> {
    return this.turmaRepository.findByProfessorId(professorId);
  }
}