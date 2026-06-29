import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Modulo } from '../model/professor.models';
import { promises } from 'dns';

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

async deletarModulo(id: number): Promise<void> {
  const response = await fetch('${this.apiUrl}/modulos/${id}', {
    method: 'DELETE',
    headers: this.getHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error (data.message || 'Erro ao deletar módulo');
  }

  
}
}
