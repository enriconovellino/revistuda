import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ComentarioAlunoProfessor, ComentarioResumoProfessor, AlunoProfessor } from '../model/professor.models';
import { EstatisticasProfessor } from '../model/professor.models';
import { DesempenhoMensal } from '../model/professor.models';
import { Turma } from '../model/turma.model';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  async getEstatisticas(professorId: number): Promise<EstatisticasProfessor> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas/estatisticas/${professorId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar estatísticas');
    }
    return data as EstatisticasProfessor;
  }

  async getDesempenhoMensal(professorId: number): Promise<DesempenhoMensal[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas/desempenho/${professorId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar desempenho mensal');
    }
    return data as DesempenhoMensal[];
  }

  async getMeusAlunos(): Promise<AlunoProfessor[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas/meus-alunos`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar alunos');
    }
    return data as AlunoProfessor[];
  }

  async getTurmasByProfessor(professorId: number): Promise<Turma[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/turmas/professor/${professorId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar turmas do professor');
    }
    return data as Turma[];
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/uploads`, {
      method: 'POST',
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
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/comentarios/modulo/${moduloId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar comentários dos alunos');
    }
    return data as ComentarioAlunoProfessor[];
  }

  async getComentariosGerais(): Promise<ComentarioResumoProfessor[]> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/comentarios/professor`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar comentários dos alunos');
    }
    return data as ComentarioResumoProfessor[];
  }

  async responderComentario(comentarioId: number, resposta: string): Promise<ComentarioResumoProfessor> {
    const response = await this.authService.fetchWithAuth(`${this.apiUrl}/comentarios/${comentarioId}/resposta`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar resposta');
    }
    return data as ComentarioResumoProfessor;
  }
}
