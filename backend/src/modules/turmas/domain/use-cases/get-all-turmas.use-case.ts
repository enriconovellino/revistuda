import { Inject, Injectable } from '@nestjs/common';
import type { ITurmaRepository } from '../ports/turma-repository.port';
import { TURMA_REPOSITORY } from '../ports/turma-repository.port';
import { Turma } from '../entities/turma.entity';

@Injectable()
export class GetAllTurmasUseCase {
  constructor(@Inject(TURMA_REPOSITORY) private turmaRepository: ITurmaRepository) {}

  async execute(): Promise<Turma[]> {
    return this.turmaRepository.findAll();
  }
}