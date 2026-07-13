import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Conteudo } from '../model/conteudo.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ConteudoService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getConteudos(): Promise<Conteudo[]> {
    const response = await fetch(`${this.apiUrl}/conteudos`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar conteúdos');
    }
    return data as Conteudo[];
  }

  async createConteudo(data: { nome_conteudo: string; tipo_conteudo: string; url_conteudo?: string; texto_conteudo?: string; licao_id: number }): Promise<Conteudo> {
    const response = await fetch(`${this.apiUrl}/conteudos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao criar conteúdo');
    }
    return resData as Conteudo;
  }

  async deleteConteudo(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/conteudos/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar conteúdo');
    }
  }

  async updateConteudo(id: number, data: Partial<Conteudo>): Promise<Conteudo> {
    const response = await fetch(`${this.apiUrl}/conteudos/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao atualizar conteúdo');
    }
    return resData as Conteudo;
  }

  async concluirConteudo(conteudoId: number): Promise<{ conteudo_id: number; data_conclusao: string }> {
    const response = await fetch(`${this.apiUrl}/conteudos/${conteudoId}/concluir`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao marcar conteúdo como concluído');
    }
    return data;
  }

  async getProgressoConteudos(moduloId: number): Promise<number[]> {
    const response = await fetch(`${this.apiUrl}/conteudos/progresso?moduloId=${moduloId}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar progresso dos conteúdos');
    }
    return data as number[];
  }
}

