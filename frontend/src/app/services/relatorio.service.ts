import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { RelatorioOverview } from '../model/relatorio.model';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  async getOverview(): Promise<RelatorioOverview | null> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/relatorios/overview`);
    if (!response.ok) return null;
    return await response.json();
  }
}
