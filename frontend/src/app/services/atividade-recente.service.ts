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

  async getAtividadesRecentes(): Promise<AtividadeRecente[]> {
    try {
      const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades-recentes`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }
}
