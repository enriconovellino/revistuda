import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { DashboardData, Modulo, Licao, Atividade } from '../model/aluno.model';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private apiUrl = environment.apiUrl;

  constructor(private authService: AuthService) {}

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async getModulos(): Promise<Modulo[]> {
    try {
      const response = await fetch(`${this.apiUrl}/modulos`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async getLicoes(): Promise<Licao[]> {
    try {
      const response = await fetch(`${this.apiUrl}/licoes`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async getAtividades(): Promise<Atividade[]> {
    try {
      const response = await fetch(`${this.apiUrl}/atividades`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    const [modulos, licoes, atividades] = await Promise.all([
      this.getModulos(),
      this.getLicoes(),
      this.getAtividades()
    ]);
    return { modulos, licoes, atividades };
  }
}
