import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Modulo } from '../model/professor.models';
import { promises } from 'dns';
import { Turma } from '../model/professor.models';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  async getModulos(): Promise<Modulo[]> {
    const response = await fetch(`${this.apiUrl}/modulos`, {
      headers: this.getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao buscar Modulos');
    return data as Modulo[];
  }
   async createModulo(modulo: Omit<Modulo, 'modulo_id'>): Promise<Modulo> {
    const response = await fetch(`${this.apiUrl}/modulos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(modulo)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao criar módulo');
    return data as Modulo;
  }
async updateModulo(id: number, modulo: Omit<Modulo, 'modulo_id'>): Promise<Modulo> {
  const response = await fetch(`${this.apiUrl}/modulos/${id}`, {
    method: 'PUT',
    headers: this.getHeaders(),
    body: JSON.stringify(modulo)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao atualizar módulo');
  return data as Modulo;
}

async deleteModulo(id: number): Promise<void> {
  const response = await fetch(`${this.apiUrl}/modulos/${id}`, {
    method: 'DELETE',
    headers: this.getHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar módulo');
  }
}

  async getTurmas(): Promise<Turma[]> {
    const response = await fetch(`${this.apiUrl}/turmas`, {
      headers: this.getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar Turmas');
    }
    return data as Turma[];
  }

  async createTurma(turma: Omit<Turma, 'turma_id'>): Promise<Turma> {
    const response = await fetch(`${this.apiUrl}/turmas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(turma)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar turma');
    }
    return data as Turma;
  }

  async deleteTurma(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/turmas/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar turma');
    }
  }
}
