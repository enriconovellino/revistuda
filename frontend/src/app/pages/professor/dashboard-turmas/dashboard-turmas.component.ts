import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Turma } from '../../../model/professor.models';
import { AuthService } from '../../../services/auth.service';
import { ProfessorService } from '../../../services/professor.service';

@Component({
  selector: 'app-dashboard-turmas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-turmas.component.html',
  styleUrl: './dashboard-turmas.component.css',
})
export class DashboardTurmasComponent implements OnInit {
  private professorService = inject(ProfessorService);
  private authService = inject(AuthService);

  turmas = signal<Turma[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  turmaSelecionada = output<Turma>();

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
    this.turmaSelecionada.emit(turma);
  }

  async ngOnInit() {
    await this.carregarTurmas();
  }
}
