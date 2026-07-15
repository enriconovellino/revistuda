import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Atividade } from '../model/atividade.model';

@Injectable({
  providedIn: 'root',
})
export class AtividadeService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  async getAtividades(): Promise<Atividade[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar atividades');
    }
    return data as Atividade[];
  }

  async getProximasAtividades(): Promise<Atividade[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/professor/proximas`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar próximas atividades');
    }
    return data as Atividade[];
  }

  async getAtividadeById(id: number): Promise<Atividade | null> {
    try {
      const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async createAtividade(data: {
    titulo_atividade: string;
    tipo_atividade: string;
    enunciado?: string | null;
    explicacao?: string | null;
    opcoes?: Atividade['opcoes'];
    pares_associacao?: Atividade['pares_associacao'];
    licao_id: number;
  }): Promise<Atividade> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao criar atividade');
    }
    return resData as Atividade;
  }

  async updateAtividade(id: number, data: Partial<Atividade>): Promise<Atividade> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao atualizar atividade');
    }
    return resData as Atividade;
  }

  async deleteAtividade(id: number): Promise<void> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar atividade');
    }
  }

  async responderAtividadeMultiplaEscolha(atividadeId: number, opcaoId: number): Promise<unknown> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/${atividadeId}/responder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opcao_id: opcaoId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao registrar resposta.');
    }
    return data;
  }

  async responderAtividadeAssociacao(
    atividadeId: number,
    respostas: { item_1_id: number; item_2_id: number }[],
  ): Promise<unknown> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/${atividadeId}/responder-associacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respostas }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao registrar resposta de associação.');
    }
    return data;
  }
}
