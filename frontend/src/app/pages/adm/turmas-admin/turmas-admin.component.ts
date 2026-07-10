import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TurmaService } from '../../../services/turma.service';
import { Turma, Usuario } from '../../../model/professor.models';

@Component({
  selector: 'app-turmas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turmas-admin.component.html',
  styleUrl: './turmas-admin.component.scss'
})
export class TurmasAdminComponent implements OnInit {
  private userService = inject(UserService);
  private turmaService = inject(TurmaService);

  loading = signal<boolean>(false);
  actionError = signal<string | null>(null);

  professors = signal<Usuario[]>([]);
  turmas = signal<Turma[]>([]);
  searchTerm = signal<string>('');
  activeFilter = signal<'cheia' | 'sem-professor' | 'com-vagas' | null>(null);

  showCreateForm = signal<boolean>(false);
  newTurmaNome = signal<string>('');
  newTurmaDescricao = signal<string>('');
  newTurmaCapacidade = signal<number | null>(null);
  newTurmaProfessorId = signal<number | null>(null);

  selectedProfessorForTurma: { [key: number]: number } = {};
  selectedCapacityForTurma: { [key: number]: number | null } = {};

  filteredTurmas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filtro = this.activeFilter();
    return this.turmas().filter((t) => {
      const matchesTerm = !term || t.nome_turma.toLowerCase().includes(term);
      const matchesFiltro =
        filtro === null ? true :
        filtro === 'cheia' ? this.isCheia(t) :
        filtro === 'sem-professor' ? !t.professor_id :
        filtro === 'com-vagas' ? this.temVagas(t) : true;
      return matchesTerm && matchesFiltro;
    });
  });

  toggleFilter(filtro: 'cheia' | 'sem-professor' | 'com-vagas') {
    this.activeFilter.set(this.activeFilter() === filtro ? null : filtro);
  }

  isCheia(turma: Turma): boolean {
    return turma.capacidade_maxima != null && (turma.totalAlunos ?? 0) >= turma.capacidade_maxima;
  }

  temVagas(turma: Turma): boolean {
    return turma.capacidade_maxima == null || (turma.totalAlunos ?? 0) < turma.capacidade_maxima;
  }

  ocupacaoPercentual(turma: Turma): number {
    if (!turma.capacidade_maxima) return 0;
    const percentual = ((turma.totalAlunos ?? 0) / turma.capacidade_maxima) * 100;
    return Math.min(100, Math.round(percentual));
  }

  statusLabel(turma: Turma): string {
    if (!turma.professor_id) return 'Sem professor';
    if (this.isCheia(turma)) return 'Cheia';
    return 'Ativa';
  }

  statusClass(turma: Turma): string {
    if (!turma.professor_id) return 'status--danger';
    if (this.isCheia(turma)) return 'status--warn';
    return 'status--ok';
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const users = await this.userService.getUsers();
      this.professors.set(users.filter((u) => u.permissions.includes('PROFESSOR') && u.approved));

      const allTurmas = await this.turmaService.getTurmas();
      this.turmas.set(allTurmas);

      allTurmas.forEach((t) => {
        this.selectedProfessorForTurma[t.turma_id] = t.professor_id || 0;
        this.selectedCapacityForTurma[t.turma_id] = t.capacidade_maxima || null;
      });
    } catch (err: any) {
      console.error('Erro ao buscar turmas', err);
    } finally {
      this.loading.set(false);
    }
  }

  getProfessorName(professorId: number): string {
    const prof = this.professors().find((p) => p.id === professorId);
    return prof ? prof.nome : 'Desconhecido';
  }

  onProfessorSelect(turmaId: number, event: any) {
    this.selectedProfessorForTurma[turmaId] = Number(event.target.value);
  }

  onCapacityInput(turmaId: number, event: any) {
    const val = event.target.value === '' ? null : Number(event.target.value);
    this.selectedCapacityForTurma[turmaId] = val;
  }

  onNewTurmaProfessorSelect(event: any) {
    const profId = Number(event.target.value);
    this.newTurmaProfessorId.set(profId === 0 ? null : profId);
  }

  async saveAllocation(turmaId: number) {
    this.actionError.set(null);
    const profId = this.selectedProfessorForTurma[turmaId];
    const capacity = this.selectedCapacityForTurma[turmaId];
    try {
      this.loading.set(true);
      await this.turmaService.updateTurma(turmaId, {
        professor_id: profId === 0 ? null : profId,
        capacidade_maxima: capacity
      });
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao atualizar turma');
    } finally {
      this.loading.set(false);
    }
  }

  async deallocateProfessor(turmaId: number) {
    this.actionError.set(null);
    try {
      this.loading.set(true);
      await this.turmaService.updateTurma(turmaId, { professor_id: null });
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao desalocar professor');
    } finally {
      this.loading.set(false);
    }
  }

  async createTurma() {
    this.actionError.set(null);
    const nome = this.newTurmaNome().trim();
    if (!nome) {
      this.actionError.set('O nome da turma é obrigatório.');
      return;
    }

    try {
      this.loading.set(true);
      await this.turmaService.createTurma({
        nome_turma: nome,
        descricao_turma: this.newTurmaDescricao().trim() || undefined,
        capacidade_maxima: this.newTurmaCapacidade(),
        professor_id: this.newTurmaProfessorId()
      });

      this.newTurmaNome.set('');
      this.newTurmaDescricao.set('');
      this.newTurmaCapacidade.set(null);
      this.newTurmaProfessorId.set(null);
      this.showCreateForm.set(false);

      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao criar turma');
    } finally {
      this.loading.set(false);
    }
  }
}
