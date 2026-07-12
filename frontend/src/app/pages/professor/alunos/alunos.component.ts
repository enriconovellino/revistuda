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
  alunos = signal<AlunoProfessor[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchTerm = signal<string>('');
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
    const term = this.searchTerm().trim().toLowerCase();
    return this.alunos().filter((a) => {
      const matchTurma = turmaId === null || a.turma_id === turmaId;
      const matchNome = !term || a.nome.toLowerCase().includes(term);
      return matchTurma && matchNome;
    });
  });

  taxaAcerto(aluno: AlunoProfessor): string {
    const { acertos, totalRespostas } = aluno.desempenho;
    if (!totalRespostas) return '—';
    return `${acertos}/${totalRespostas} (${aluno.desempenho.taxaAcerto}%)`;
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
