import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Conteudo {
  conteudo_id: number;
  nome_conteudo: string;
  tipo_conteudo: string;
  video_url?: string;
  audio_link?: string;
  texto_conteudo?: string;
}

export interface ConteudoPayload {
  nome_conteudo: string;
  tipo_conteudo: string;
  video_url?: string;
  audio_link?: string;
  texto_conteudo?: string;
}

@Injectable({ providedIn: 'root' })
export class ConteudosService {
  constructor(private api: ApiService) {}

  getAll(): Promise<Conteudo[]> {
    return this.api.get<Conteudo[]>('/conteudos');
  }

  create(payload: ConteudoPayload): Promise<Conteudo> {
    return this.api.post<Conteudo>('/conteudos', payload);
  }

  update(id: number, payload: Partial<ConteudoPayload>): Promise<Conteudo> {
    return this.api.put<Conteudo>(`/conteudos/${id}`, payload);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(`/conteudos/${id}`);
  }
}
