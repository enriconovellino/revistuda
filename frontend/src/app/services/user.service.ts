import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Usuario } from '../model/professor.models';

export interface UpdateUserData {
  nome?: string;
  email?: string;
  senha?: string;
  senha_atual?: string;
  turma_id?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  async getUsers(): Promise<Usuario[]> {
    try {
      const response = await this.authService.fetchWithAuth(`${this.apiUrl}/users`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async approveUser(id: number): Promise<Usuario> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/users/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Falha ao aprovar usuário');
    }
    return await response.json();
  }

  async rejectUser(id: number): Promise<void> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/users/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Falha ao recusar usuário');
    }
  }

  async revokeProfessorAccess(id: number): Promise<{ user: Usuario; turmasDesalocadas: number }> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/users/${id}/revoke`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao revogar acesso do professor');
    }
    return data;
  }

  async deleteUser(id: number): Promise<void> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      let message = 'Falha ao excluir usuário';
      try {
        const data = await response.json();
        message = data.message || message;
      } catch { }
      throw new Error(message);
    }
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<Usuario> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao atualizar usuário');
    }
    return data;
  }
}
