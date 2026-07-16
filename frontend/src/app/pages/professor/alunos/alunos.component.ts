import { Component, OnInit, signal, computed, inject, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoProfessor } from '../../../model/professor.models';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-alunos-professor',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent],
  templateUrl: './alunos.component.html',
  styleUrl: './alunos.component.css',
})
export class AlunosProfessorComponent implements OnInit {
  alunos = signal<AlunoProfessor[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchTerm = signal<string>('');
  turmaFiltro = signal<number | null>(null);

  readonly PAGE_SIZE = 10;
  paginaAtual = signal(1);

  private professorService = inject(ProfessorService);
  private router = inject(Router);

  constructor() {
    // Reset to page 1 whenever the filtered set changes
    effect(() => {
      this.alunosFiltrados(); // track filter changes
      untracked(() => this.paginaAtual.set(1));
    });
  }

  turmasDisponiveis = computed(() => {
    const mapa = new Map<number, string>();
    this.alunos().forEach((a) => mapa.set(a.turma_id, a.nome_turma));
    return Array.from(mapa.entries()).map(([turma_id, nome_turma]) => ({ turma_id, nome_turma }));
  });

  alunosFiltrados = computed(() => {
    const turmaId = this.turmaFiltro();
    const term = this.searchTerm().trim().toLowerCase();
    return this.alunos().filter((a) => {
      const matchTurma = turmaId === null || a.turma_id === turmaId;
      const matchNome = !term || a.nome.toLowerCase().includes(term);
      return matchTurma && matchNome;
    });
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.alunosFiltrados().length / this.PAGE_SIZE)));

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  mediaAcertos = computed(() => {
    const lista = this.alunos();
    const comRespostas = lista.filter((a) => a.desempenho.totalRespostas > 0);
    if (!comRespostas.length) return 0;
    const soma = comRespostas.reduce((acc, a) => acc + a.desempenho.taxaAcerto, 0);
    return Math.round(soma / comRespostas.length);
  });

  alunosPaginados = computed(() =>
    this.alunosFiltrados().slice(
      (this.paginaAtual() - 1) * this.PAGE_SIZE,
      this.paginaAtual() * this.PAGE_SIZE
    )
  );

  mudarPagina(p: number) {
    this.paginaAtual.set(p);
  }

  taxaAcerto(aluno: AlunoProfessor): string {
    const { acertos, totalRespostas } = aluno.desempenho;
    if (!totalRespostas) return '—';
    return `${acertos}/${totalRespostas} (${aluno.desempenho.taxaAcerto}%)`;
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  statusClass(aluno: AlunoProfessor): string {
    if (!aluno.desempenho.totalRespostas) return 'status-inativo';
    const t = aluno.desempenho.taxaAcerto;
    if (t >= 80) return 'status-destaque';
    if (t >= 50) return 'status-ativo';
    return 'status-alerta';
  }

  statusLabel(aluno: AlunoProfessor): string {
    if (!aluno.desempenho.totalRespostas) return 'Inativo';
    const t = aluno.desempenho.taxaAcerto;
    if (t >= 80) return 'Em Destaque';
    if (t >= 50) return 'Ativo';
    return 'Alerta';
  }

  ultimaAtividade(aluno: AlunoProfessor): string {
    if (!aluno.desempenho.totalRespostas) return 'Nunca acessou';
    return 'Recentemente';
  }

  taxaClass(aluno: AlunoProfessor): string {
    if (!aluno.desempenho.totalRespostas) return 'taxa-sem-dados';
    const t = aluno.desempenho.taxaAcerto;
    if (t >= 70) return 'taxa-ok';
    if (t >= 40) return 'taxa-warn';
    return 'taxa-danger';
  }

  ngOnInit() {
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
    this.searchTerm.set('');
  }

  voltar() {
    this.router.navigate(['/professor/turmas']);
  }
}
