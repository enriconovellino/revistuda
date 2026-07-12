import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { ComentarioAlunoProfessor, ComentarioResumoProfessor, AlunoProfessor } from '../model/professor.models';
import { AuthService } from './auth.service';
import { EstatisticasProfessor } from '../model/professor.models';
import { DesempenhoMensal } from '../model/professor.models';
import { Turma } from '../model/turma.model';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getEstatisticas(professorId: number): Promise<EstatisticasProfessor> {
    const response = await fetch(`${this.apiUrl}/turmas/estatisticas/${professorId}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar estatísticas');
    }
    return data as EstatisticasProfessor;
  }

  async getDesempenhoMensal(professorId: number): Promise<DesempenhoMensal[]> {
    const response = await fetch(`${this.apiUrl}/turmas/desempenho/${professorId}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar desempenho mensal');
    }
    return data as DesempenhoMensal[];
  }

  async getMeusAlunos(): Promise<AlunoProfessor[]> {
    const response = await fetch(`${this.apiUrl}/turmas/meus-alunos`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar alunos');
    }
    return data as AlunoProfessor[];
  }

  async getTurmasByProfessor(professorId: number): Promise<Turma[]> {
    const response = await fetch(`${this.apiUrl}/turmas/professor/${professorId}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar turmas do professor');
    }

    return data as Turma[];
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getAccessToken();
    const response = await fetch(`${this.apiUrl}/uploads`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer upload da imagem');
    }
    return data;
  }

  // --- Comentários dos alunos sobre os conteúdos (visão do professor) ---

  async getComentariosPorModulo(moduloId: number): Promise<ComentarioAlunoProfessor[]> {
    const response = await fetch(`${this.apiUrl}/comentarios/modulo/${moduloId}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar comentários dos alunos');
    }
    return data as ComentarioAlunoProfessor[];
  }

  async getComentariosGerais(): Promise<ComentarioResumoProfessor[]> {
    const response = await fetch(`${this.apiUrl}/comentarios/professor`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar comentários dos alunos');
    }
    return data as ComentarioResumoProfessor[];
  }

  async responderComentario(comentarioId: number, resposta: string): Promise<ComentarioResumoProfessor> {
    const response = await fetch(`${this.apiUrl}/comentarios/${comentarioId}/resposta`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ resposta }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar resposta');
    }
    return data as ComentarioResumoProfessor;
  }
}
