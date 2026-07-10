import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { ComentarioResumoProfessor } from '../../../model/professor.models';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-comentarios-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios-alunos.component.html',
  styleUrl: './comentarios-alunos.component.css',
})
export class ComentariosAlunosComponent implements OnInit {
  userName = signal<string>('Professor');

  comentarios = signal<ComentarioResumoProfessor[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  turmaFiltro = signal<number | null>(null);
  moduloFiltro = signal<number | null>(null);

  private professorService = inject(ProfessorService);
  private router = inject(Router);

  // Lista única de turmas presentes nos comentários (pra popular o select)
  turmasDisponiveis = computed(() => {
    const mapa = new Map<number, string>();
    this.comentarios().forEach(c => mapa.set(c.turma.turma_id, c.turma.nome_turma));
    return Array.from(mapa.entries()).map(([turma_id, nome_turma]) => ({ turma_id, nome_turma }));
  });

  // Lista de módulos disponíveis, já filtrada pela turma selecionada (se houver)
  modulosDisponiveis = computed(() => {
    const turmaId = this.turmaFiltro();
    const mapa = new Map<number, string>();
    this.comentarios()
      .filter(c => turmaId === null || c.turma.turma_id === turmaId)
      .forEach(c => mapa.set(c.modulo.modulo_id, c.modulo.titulo_modulo));
    return Array.from(mapa.entries()).map(([modulo_id, titulo_modulo]) => ({ modulo_id, titulo_modulo }));
  });

  // Comentários já filtrados por turma e módulo selecionados
  comentariosFiltrados = computed(() => {
    const turmaId = this.turmaFiltro();
    const moduloId = this.moduloFiltro();
    return this.comentarios().filter(c => {
      if (turmaId !== null && c.turma.turma_id !== turmaId) return false;
      if (moduloId !== null && c.modulo.modulo_id !== moduloId) return false;
      return true;
    });
  });

  // Resumo geral (cards no topo)
  totalComentarios = computed(() => this.comentarios().length);
  totalAlunosUnicos = computed(() => new Set(this.comentarios().map(c => c.aluno.id)).size);
  totalModulosComComentario = computed(() => new Set(this.comentarios().map(c => c.modulo.modulo_id)).size);

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
      const comentarios = await this.professorService.getComentariosGerais();
      this.comentarios.set(comentarios);
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao carregar os comentários dos alunos.'));
    } finally {
      this.loading.set(false);
    }
  }

  onTurmaChange(value: string) {
    this.turmaFiltro.set(value ? Number(value) : null);
    this.moduloFiltro.set(null); // reseta o módulo ao trocar de turma
  }

  onModuloChange(value: string) {
    this.moduloFiltro.set(value ? Number(value) : null);
  }

  limparFiltros() {
    this.turmaFiltro.set(null);
    this.moduloFiltro.set(null);
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
paginaAtual() {
  return 'comentarios';
}

irPara(pagina: string) {
  switch (pagina) {
    case 'dashboard':
      this.irParaDashboard();
      break;

    case 'turmas':
      this.irParaTurmas();
      break;

    case 'comentarios':
      this.irParaComentarios();
      break;
  }
}

irParaComentarios() {
  this.router.navigate(['/comentarios-alunos']); // ajuste a rota se necessário
}

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}