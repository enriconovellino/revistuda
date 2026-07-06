import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Modulo, Turma, Licao, Conteudo } from '../model/professor.models';
import { AuthService } from './auth.service';

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
      Authorization: `Bearer ${token}`,
    };
  }

  async getModulos(): Promise<Modulo[]> {
    const response = await fetch(`${this.apiUrl}/modulos`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar Modulos');
    }

    return data as Modulo[];
  }

  async createModulo(
    modulo: Omit<Modulo, 'modulo_id'> & { turma_id: number },
  ): Promise<Modulo> {
    const response = await fetch(`${this.apiUrl}/modulos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(modulo),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar módulo');
    }

    return data as Modulo;
  }

  async updateModulo(
    id: number,
    modulo: Partial<Omit<Modulo, 'modulo_id'>>,
  ): Promise<Modulo> {
    const response = await fetch(`${this.apiUrl}/modulos/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(modulo),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar módulo');
    }

    return data as Modulo;
  }

  async deleteModulo(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/modulos/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar módulo');
    }
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

  async getModuloById(id: number): Promise<Modulo> {
    const response = await fetch(`${this.apiUrl}/modulos/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar módulo');
    }
    return data as Modulo;
  }

  async getLicoes(): Promise<Licao[]> {
    const response = await fetch(`${this.apiUrl}/licoes`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar lições');
    }
    return data as Licao[];
  }

  async createLicao(data: { titulo_licao: string; comentario?: string; modulo_id: number }): Promise<Licao> {
    const response = await fetch(`${this.apiUrl}/licoes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao criar lição');
    }
    return resData as Licao;
  }

  async deleteLicao(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/licoes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar lição');
    }
  }

  async getConteudos(): Promise<Conteudo[]> {
    const response = await fetch(`${this.apiUrl}/conteudos`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar conteúdos');
    }
    return data as Conteudo[];
  }

  async createConteudo(data: { nome_conteudo: string; tipo_conteudo: string; url_conteudo?: string; texto_conteudo?: string; licao_id: number }): Promise<Conteudo> {
    const response = await fetch(`${this.apiUrl}/conteudos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao criar conteúdo');
    }
    return resData as Conteudo;
  }

  async deleteConteudo(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/conteudos/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar conteúdo');
    }
  }

  async updateConteudo(id: number, data: Partial<Conteudo>): Promise<Conteudo> {
    const response = await fetch(`${this.apiUrl}/conteudos/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao atualizar conteúdo');
    }
    return resData as Conteudo;
  }
}
