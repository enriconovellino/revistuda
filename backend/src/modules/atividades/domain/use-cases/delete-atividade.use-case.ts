import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';

@Injectable()
export class DeleteAtividadeUseCase {
    constructor(@Inject(ATIVIDADE_REPOSITORY) private atividadeRepository: IAtividadeRepository) {}

    async execute(id: number): Promise<void> {
        const atividade = await this.atividadeRepository.findById(id);
        if (!atividade) {
            throw new NotFoundException(`Atividade com id = ${id} não encontrada`);
        }
        await this.atividadeRepository.delete(id);
    }
}