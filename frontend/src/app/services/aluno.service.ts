import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);


  constructor() { }

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private getUserId(): number | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.id ?? user.usuario_id ?? null;
  }

  async iniciarAtividade(atividadeId: number): Promise<{ status: string; data_inicio: string | null; data_conclusao: string | null }> {
    const response = await fetch(`${this.apiUrl}/atividades/${atividadeId}/iniciar`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao iniciar atividade.');
    }
    return data;
  }


  async saveComentario(conteudoId: number, texto: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/comentarios`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ conteudoId, texto: texto.trim() })
      });
      if (!response.ok) throw new Error('Falha ao salvar comentário.');
    } catch (error) {
      console.error('Erro ao salvar comentário:', error);
      throw error;
    }
  }

  async getComentariosDoAluno(conteudoIds: number[]): Promise<{ [conteudoId: number]: string }> {
    const resultado: { [conteudoId: number]: string } = {};
    const userId = this.getUserId();
    if (!userId) return resultado;

    await Promise.all(conteudoIds.map(async (conteudoId) => {
      try {
        const response = await fetch(`${this.apiUrl}/comentarios/conteudo/${conteudoId}`, {
          headers: this.getHeaders()
        });
        if (!response.ok) return;
        const comentarios: Array<{ texto: string; aluno: { id: number } }> = await response.json();
        const meuComentario = comentarios.find(c => c.aluno.id === userId);
        if (meuComentario) resultado[conteudoId] = meuComentario.texto;
      } catch {
      }
    }));

    return resultado;
  }
}