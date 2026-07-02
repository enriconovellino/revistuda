import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Modulo {
  modulo_id: number;
  titulo_modulo: string;
  descricao_id?: string; // note: presenter maps descricao_modulo → descricao_id
  dificuldade: string;
}

export interface ModuloPayload {
  titulo_modulo: string;
  descricao_modulo?: string;
  dificuldade: string;
}

@Injectable({ providedIn: 'root' })
export class ModulosService {
  constructor(private api: ApiService) {}

  getAll(): Promise<Modulo[]> {
    return this.api.get<Modulo[]>('/modulos');
  }

  create(payload: ModuloPayload): Promise<Modulo> {
    return this.api.post<Modulo>('/modulos', payload);
  }

  update(id: number, payload: Partial<ModuloPayload>): Promise<Modulo> {
    return this.api.put<Modulo>(`/modulos/${id}`, payload);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(`/modulos/${id}`);
  }
}
