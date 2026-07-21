import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ComentarioAlunoProfessor } from '../model/professor.models';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);

  constructor() { }

  private getUserId(): number | null {
    const user = this.authService.getUser();
    if (!user) return null;
    return (user as { id?: number; usuario_id?: number }).id
      ?? (user as { id?: number; usuario_id?: number }).usuario_id
      ?? null;
  }
  async iniciarAtividade(atividadeId: number): Promise<{ status: string; data_inicio: string | null; data_conclusao: string | null }> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/atividades/${atividadeId}/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Falha ao iniciar atividade.');
    }
    return data;
  }

  async saveComentario(conteudoId: number, texto: string): Promise<void> {
    try {
      const response = await this.authService.fetchWithAuth(`${this.apiUrl}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const response = await this.authService.fetchWithAuth(`${this.apiUrl}/comentarios/conteudo/${conteudoId}`);
        if (!response.ok) return;
        const comentarios: Array<{ texto: string; aluno: { id: number } }> = await response.json();
        const meuComentario = comentarios.find(c => c.aluno.id === userId);
        if (meuComentario) resultado[conteudoId] = meuComentario.texto;
      } catch {
      }
    }));

    return resultado;
  }

  async getComentariosCompletosDoAluno(conteudoIds: number[]): Promise<{ [conteudoId: number]: ComentarioAlunoProfessor }> {
    const resultado: { [conteudoId: number]: ComentarioAlunoProfessor } = {};
    const userId = this.getUserId();
    if (!userId) return resultado;

    await Promise.all(conteudoIds.map(async (conteudoId) => {
      try {
        const response = await this.authService.fetchWithAuth(`${this.apiUrl}/comentarios/conteudo/${conteudoId}`);
        if (!response.ok) return;
        const comentarios: ComentarioAlunoProfessor[] = await response.json();
        const meuComentario = comentarios.find(c => c.aluno.id === userId);
        if (meuComentario) resultado[conteudoId] = meuComentario;
      } catch {
      }
    }));

    return resultado;
  }
}
