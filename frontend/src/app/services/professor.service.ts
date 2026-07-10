import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Modulo, Turma, Licao, Conteudo, Atividade, ComentarioAlunoProfessor, ComentarioResumoProfessor } from '../model/professor.models';
import { AuthService } from './auth.service';
import { EstatisticasProfessor } from '../model/professor.models';
import { DesempenhoMensal} from '../model/professor.models';
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

  async getAtividades(): Promise<Atividade[]> {
    const response = await fetch(`${this.apiUrl}/atividades`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar atividades');
    }
    return data as Atividade[];
  }

  async createAtividade(data: {
    titulo_atividade: string;
    tipo_atividade: string;
    enunciado?: string | null;
    opcoes?: Atividade['opcoes'];
    pares_associacao?: Atividade['pares_associacao'];
    licao_id: number;
  }): Promise<Atividade> {
    const response = await fetch(`${this.apiUrl}/atividades`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao criar atividade');
    }
    return resData as Atividade;
  }

  async updateAtividade(id: number, data: Partial<Atividade>): Promise<Atividade> {
    const response = await fetch(`${this.apiUrl}/atividades/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Erro ao atualizar atividade');
    }
    return resData as Atividade;
  }

  async deleteAtividade(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/atividades/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao deletar atividade');
    }
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

  // Resumo geral: todos os comentários de todas as turmas do professor logado
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
}