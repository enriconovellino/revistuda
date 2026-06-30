import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Turma {
  turma_id: number;
  nome_turma: string;
  descricao_turma?: string;
  capacidade_maxima?: number;
}

export interface TurmaPayload {
  nome_turma: string;
  descricao_turma?: string;
  capacidade_maxima?: number;
}

@Injectable({ providedIn: 'root' })
export class TurmasService {
  constructor(private api: ApiService) {}

  getAll(): Promise<Turma[]> {
    return this.api.get<Turma[]>('/turmas');
  }

  create(payload: TurmaPayload): Promise<Turma> {
    return this.api.post<Turma>('/turmas', payload);
  }

  update(id: number, payload: Partial<TurmaPayload>): Promise<Turma> {
    return this.api.put<Turma>(`/turmas/${id}`, payload);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(`/turmas/${id}`);
  }
}
