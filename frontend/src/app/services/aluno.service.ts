import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { DashboardData, Modulo, Licao, Atividade } from '../model/aluno.model';

// Conteudo não existia em aluno.model — adicionei aqui.
// Se preferir, mova essa interface pra dentro de aluno.model.ts junto das outras.
export interface Conteudo {
  conteudo_id: number;
  nome_conteudo: string;
  tipo_conteudo: string;
  texto_conteudo?: string;
  url_conteudo?: string;
  licao_id: number;
  safeUrl?: any;
}

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

  async getModuloById(id: number): Promise<Modulo | null> {
    try {
      const response = await fetch(`${this.apiUrl}/modulos/${id}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
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

  async getConteudos(): Promise<Conteudo[]> {
    try {
      const response = await fetch(`${this.apiUrl}/conteudos`, {
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

  // --- Progresso (front-end only por enquanto, via localStorage) ---
  // Quando existir endpoint de progresso no backend, troca essas duas
  // funções por chamadas fetch reais mantendo a mesma assinatura.

  private progressKey(moduloId: number): string {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? (JSON.parse(userStr).id ?? JSON.parse(userStr).usuario_id) : 'anon';
    return `progresso_modulo_${moduloId}_user_${userId}`;
  }

  getLicoesConcluidas(moduloId: number): number[] {
    const raw = localStorage.getItem(this.progressKey(moduloId));
    return raw ? JSON.parse(raw) : [];
  }

  toggleLicaoConcluida(moduloId: number, licaoId: number): number[] {
    const atuais = this.getLicoesConcluidas(moduloId);
    const index = atuais.indexOf(licaoId);
    if (index >= 0) {
      atuais.splice(index, 1);
    } else {
      atuais.push(licaoId);
    }
    localStorage.setItem(this.progressKey(moduloId), JSON.stringify(atuais));
    return atuais;
  }

  // --- Comentários dos alunos sobre cada conteúdo (front-end only por enquanto) ---
  // Igual ao progresso: quando existir endpoint no backend, troca por fetch real
  // mantendo a mesma assinatura (get/save por conteudoId).

  private commentKey(conteudoId: number): string {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? (JSON.parse(userStr).id ?? JSON.parse(userStr).usuario_id) : 'anon';
    return `comentario_conteudo_${conteudoId}_user_${userId}`;
  }

  getComentario(conteudoId: number): string {
    return localStorage.getItem(this.commentKey(conteudoId)) || '';
  }

  saveComentario(conteudoId: number, texto: string): void {
    if (texto.trim()) {
      localStorage.setItem(this.commentKey(conteudoId), texto.trim());
    } else {
      localStorage.removeItem(this.commentKey(conteudoId));
    }
  }
}