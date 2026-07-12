import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Turma } from '../../../model/turma.model';
import { AuthService } from '../../../services/auth.service';
import { ProfessorService } from '../../../services/professor.service';

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

  percentualOcupacao(turma: Turma): number {
    if (!turma.capacidade_maxima) return 0;
    return Math.min(100, ( turma.capacidade_maxima) * 100);
  }

  corBarra(turma: Turma): string {
    const percentual = this.percentualOcupacao(turma);
    if (percentual >= 90) return 'alta';
    if (percentual >= 60) return 'media';
    return 'baixa';
  }

  turmas = signal<Turma[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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
