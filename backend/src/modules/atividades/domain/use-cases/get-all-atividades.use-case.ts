import { Inject, Injectable } from '@nestjs/common';
import { ATIVIDADE_REPOSITORY } from '../ports/atividade-repository.port';
import type { IAtividadeRepository } from '../ports/atividade-repository.port';
import { Atividade } from '../entities/atividade.entity';

@Injectable()
export class GetAllAtividadesUseCase {
    constructor(@Inject(ATIVIDADE_REPOSITORY) private atividadeRepository: IAtividadeRepository) {}
    
    async execute(): Promise<Atividade[]> {
        return this.atividadeRepository.findAll();
    }
}