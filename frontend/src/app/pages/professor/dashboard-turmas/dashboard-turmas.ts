import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { Turma } from '../../../model/professor.models';
import { AuthService } from '../../../services/auth.service';
import { ProfessorService } from '../../../services/professor.service';

@Component({
  selector: 'app-dashboard-turmas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-turmas.html',
  styleUrl: './dashboard-turmas.css',
})
export class DashboardTurmas implements OnInit {
  private professorService = inject(ProfessorService);
  private authService = inject(AuthService);

  readonly itensPorPagina = 6;

  turmas = signal<Turma[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  paginaAtual = signal(1);

  turmaSelecionada = output<Turma>();

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.turmas().length / this.itensPorPagina)));

  turmasPaginadas = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.turmas().slice(inicio, inicio + this.itensPorPagina);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  async carregarTurmas() {
    try {
      this.loading.set(true);
      const user = this.authService.getUser();
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const turmas = await this.professorService.getTurmasByProfessor(user.id);
      this.turmas.set(turmas);
      this.paginaAtual.set(1);
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

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
    }
  }

  async ngOnInit() {
    await this.carregarTurmas();
  }
}