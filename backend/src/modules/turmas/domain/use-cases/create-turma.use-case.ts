import { Inject, Injectable } from '@nestjs/common';
import { TURMA_REPOSITORY } from '../ports/turma-repository.port';
import type { ITurmaRepository } from '../ports/turma-repository.port';
import { Turma } from '../entities/turma.entity';

export interface CreateTurmaInput {
  nome_turma: string;
  descricao_turma?: string;
  capacidade_maxima?: number;
}

@Injectable()
export class CreateTurmaUseCase {
  constructor(@Inject(TURMA_REPOSITORY) private turmaRepository: ITurmaRepository) {}

  async execute(input: CreateTurmaInput): Promise<Turma> {
    const turma = new Turma(0, input.nome_turma, input.descricao_turma, input.capacidade_maxima);
    return this.turmaRepository.create(turma);
  }
}