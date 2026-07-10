import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { DashboardData, Modulo, Licao, Atividade } from '../model/aluno.model';

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
  constructor(private authService: AuthService) { }

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

  async getAtividadeById(id: number): Promise<Atividade | null> {
    try {
      const response = await fetch(`${this.apiUrl}/atividades/${id}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async responderAtividadeMultiplaEscolha(atividadeId: number, opcaoId: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/atividades/${atividadeId}/responder`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ opcao_id: opcaoId })
      });
      if (!response.ok) throw new Error('Falha ao registrar resposta.');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async responderAtividadeAssociacao(atividadeId: number, respostas: { item_1_id: number, item_2_id: number }[]): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/atividades/${atividadeId}/responder-associacao`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ respostas })
      });
      if (!response.ok) throw new Error('Falha ao registrar resposta de associação.');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
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