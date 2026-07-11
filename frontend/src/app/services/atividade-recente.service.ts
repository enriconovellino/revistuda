import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface AtividadeRecente {
  atividade_recente_id: number;
  tipo: string;
  descricao: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtividadeRecenteService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async getAtividadesRecentes(): Promise<AtividadeRecente[]> {
    try {
      const response = await fetch(`${this.apiUrl}/atividades-recentes`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }
}
