import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Turma } from '../model/professor.models';

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    const user = this.authService.getUser();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(user ? { 'X-USER-ID': user.id.toString() } : {})
    };
  }

  async getTurmas(): Promise<Turma[]> {
    const response = await fetch(`${this.apiUrl}/turmas`, {
      headers: this.getHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  }

  async updateTurma(id: number, data: Partial<Turma>): Promise<Turma> {
    const response = await fetch(`${this.apiUrl}/turmas/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Falha ao atualizar turma');
    }
    return await response.json();
  }

  async deleteTurma(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/turmas/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
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
    const response = await fetch(`${this.apiUrl}/turmas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Falha ao criar turma');
    }
    return await response.json();
  }
}
