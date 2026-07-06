import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITurmaRepository } from '../ports/turma-repository.port';
import { TURMA_REPOSITORY } from '../ports/turma-repository.port';
import { Turma } from '../entities/turma.entity';

export interface UpdateTurmaInput {
  id: number;
  nome_turma?: string;
  descricao_turma?: string;
  capacidade_maxima?: number;
  professor_id?: number | null;
}

@Injectable()
export class UpdateTurmaUseCase {
  constructor(@Inject(TURMA_REPOSITORY) private turmaRepository: ITurmaRepository) {}

  async execute(input: UpdateTurmaInput): Promise<Turma> {
    const exists = await this.turmaRepository.findById(input.id);
    if (!exists) throw new NotFoundException('Turma não encontrada');
    return this.turmaRepository.update(input.id, input);
  }
}