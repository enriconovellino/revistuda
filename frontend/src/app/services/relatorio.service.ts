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

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    const user = this.authService.getUser();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(user ? { 'X-USER-ID': user.id.toString() } : {})
    };
  }

  async getOverview(): Promise<RelatorioOverview | null> {
    const response = await fetch(`${this.apiUrl}/relatorios/overview`, {
      headers: this.getHeaders()
    });
    if (!response.ok) return null;
    return await response.json();
  }
}
