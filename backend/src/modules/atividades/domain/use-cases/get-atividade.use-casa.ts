import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import { Atividade } from '../entities/atividade.entity';

@Injectable()
export class GetAtividadeUseCase {
    constructor(@Inject(ATIVIDADE_REPOSITORY) private atividadeRepository: IAtividadeRepository) {}

    async execute(id: number): Promise<Atividade> {
        const atividade = await this.atividadeRepository.findById(id);
        if (!atividade) {
            throw new NotFoundException(`Atividade com id = ${id} não encontrada`);
        }
        return atividade;
    }
}