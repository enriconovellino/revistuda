import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

  async getUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/users`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async approveUser(id: number): Promise<any> {
    const response = await fetch(`${this.apiUrl}/users/${id}/approve`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Falha ao aprovar usuário');
    }
    return await response.json();
  }

  async rejectUser(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Falha ao recusar usuário');
    }
  }

  async revokeProfessorAccess(id: number): Promise<{ user: any; turmasDesalocadas: number }> {
    const response = await fetch(`${this.apiUrl}/users/${id}/revoke`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao revogar acesso do professor');
    }
    return data;
  }

  async updateUser(id: number, userData: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao atualizar usuário');
    }
    return data;
  }
}
