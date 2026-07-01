import { Injectable, Inject } from '@nestjs/common';
import { Atividade } from '../entities/atividade.entity';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';

export interface UpdateAtividadeInput {
    titulo_atividade?: string;
    descricao_atividade?: string | null;
    tipo_atividade?: string;
    licao_id?: number;
}

@Injectable()
export class UpdateAtividadeUseCase {
    constructor(@Inject(ATIVIDADE_REPOSITORY) private atividadeRepository: IAtividadeRepository) {}

    async execute(id: number, input: UpdateAtividadeInput): Promise<Atividade> {
        const atividade = await this.atividadeRepository.findById(id);
        if (!atividade) {
            throw new Error(`Atividade com ID ${id} não encontrada`);
        }
        return this.atividadeRepository.update(id, input);
    }
}