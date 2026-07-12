import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoProfessor } from '../../../model/professor.models';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-alunos-professor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alunos.component.html',
  styleUrl: './alunos.component.css',
})
export class AlunosProfessorComponent implements OnInit {
  userName = signal<string>('Professor');

  alunos = signal<AlunoProfessor[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  turmaFiltro = signal<number | null>(null);

  private professorService = inject(ProfessorService);
  private router = inject(Router);

  turmasDisponiveis = computed(() => {
    const mapa = new Map<number, string>();
    this.alunos().forEach((a) => mapa.set(a.turma_id, a.nome_turma));
    return Array.from(mapa.entries()).map(([turma_id, nome_turma]) => ({ turma_id, nome_turma }));
  });

  alunosFiltrados = computed(() => {
    const turmaId = this.turmaFiltro();
    return this.alunos().filter((a) => turmaId === null || a.turma_id === turmaId);
  });

  totalAlunos = computed(() => this.alunosFiltrados().length);

  totalTurmas = computed(() => {
    return new Set(this.alunosFiltrados().map((a) => a.turma_id)).size;
  });

  mediaAcerto = computed(() => {
    const lista = this.alunosFiltrados().filter((a) => a.desempenho.totalRespostas > 0);
    if (lista.length === 0) {
      return 0;
    }
    const soma = lista.reduce((acc, a) => acc + a.desempenho.taxaAcerto, 0);
    return Math.round(soma / lista.length);
  });

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
    this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const alunos = await this.professorService.getMeusAlunos();
      this.alunos.set(alunos);
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao carregar os alunos.'));
    } finally {
      this.loading.set(false);
    }
  }

  onTurmaChange(value: string) {
    this.turmaFiltro.set(value ? Number(value) : null);
  }

  limparFiltros() {
    this.turmaFiltro.set(null);
  }

  voltar() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
  }

  irParaDashboard() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'dashboard' } });
  }

  irParaTurmas() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
  }

  irParaComentarios() {
    this.router.navigate(['/professor/comentarios']);
  }

  irParaAlunos() {
    this.router.navigate(['/professor/alunos']);
  }

  irPara(pagina: string) {
    switch (pagina) {
      case 'dashboard':
        this.irParaDashboard();
        break;
      case 'turmas':
        this.irParaTurmas();
        break;
      case 'alunos':
        this.irParaAlunos();
        break;
      case 'comentarios':
        this.irParaComentarios();
        break;
    }
  }

  paginaAtual() {
    return 'alunos';
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
