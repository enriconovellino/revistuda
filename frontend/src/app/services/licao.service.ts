import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Licao } from '../model/licao.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LicaoService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getLicoes(): Promise<Licao[]> {
    const response = await fetch(`${this.apiUrl}/licoes`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar lições');
    }
    return data as Licao[];
  }

  async createLicao(data: { titulo_licao: string; comentario?: string; modulo_id: number }): Promise<Licao> {
    const response = await fetch(`${this.apiUrl}/licoes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao criar lição');
    }
    return resData as Licao;
  }

  async deleteLicao(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/licoes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar lição');
    }
  }
}
