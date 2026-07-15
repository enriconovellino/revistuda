import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Turma } from '../model/turma.model';

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  async getTurmas(): Promise<Turma[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas`);
    if (!response.ok) return [];
    return await response.json();
  }

  async updateTurma(id: number, data: Partial<Turma>): Promise<Turma> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Falha ao atualizar turma');
    }
    return await response.json();
  }

  async deleteTurma(id: number): Promise<void> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      let message = 'Falha ao excluir turma';
      try {
        const errData = await response.json();
        message = errData.message || message;
      } catch { }
      throw new Error(message);
    }
  }

  async createTurma(data: { nome_turma: string; descricao_turma?: string; capacidade_maxima?: number | null; professor_id?: number | null }): Promise<Turma> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Falha ao criar turma');
    }
    return await response.json();
  }
}
