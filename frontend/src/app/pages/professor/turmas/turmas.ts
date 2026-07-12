import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Turma } from '../../../model/turma.model';
import { AuthService } from '../../../services/auth.service';
import { ProfessorService } from '../../../services/professor.service';
import { MAX_ALUNOS_POR_TURMA } from '../../../model/professor.models';

@Component({
  selector: 'app-turmas-professor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turmas.html',
  styleUrl: './turmas.scss',
})
export class TurmasProfessorComponent implements OnInit {
  private professorService = inject(ProfessorService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly maxAlunos = MAX_ALUNOS_POR_TURMA;

  turmas = signal<Turma[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  capacidadeEfetiva(turma: Turma): number {
    return Math.min(turma.capacidade_maxima ?? MAX_ALUNOS_POR_TURMA, MAX_ALUNOS_POR_TURMA);
  }

  isCheia(turma: Turma): boolean {
    return (turma.totalAlunos ?? 0) >= this.capacidadeEfetiva(turma);
  }

  ocupacaoPercentual(turma: Turma): number {
    const percentual = ((turma.totalAlunos ?? 0) / this.capacidadeEfetiva(turma)) * 100;
    return Math.min(100, Math.round(percentual));
  }

  statusLabel(turma: Turma): string {
    if (this.isCheia(turma)) return 'Cheia';
    return 'Ativa';
  }

  statusClass(turma: Turma): string {
    if (this.isCheia(turma)) return 'status--warn';
    return 'status--ok';
  }

  async carregarTurmas() {
    try {
      this.loading.set(true);
      const user = this.authService.getUser();
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const turmas = await this.professorService.getTurmasByProfessor(user.id);
      this.turmas.set(turmas);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar turmas';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  verDetalhes(turma: Turma) {
    this.router.navigate(['/professor/modulos'], { queryParams: { turmaId: turma.turma_id } });
  }

  async ngOnInit() {
    await this.carregarTurmas();
  }
}
