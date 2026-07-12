import { Component, HostListener, OnInit, computed, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TurmaService } from '../../../services/turma.service';
import { MAX_ALUNOS_POR_TURMA, Usuario } from '../../../model/professor.models';
import { Turma } from '../../../model/turma.model';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';

@Component({
  selector: 'app-turmas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, PaginatorComponent],
  templateUrl: './turmas.component.html',
  styleUrl: './turmas.component.scss'
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

  turmaParaExcluir = signal<Turma | null>(null);
  deleteLoading = signal<boolean>(false);

  menuAbertoId = signal<number | null>(null);

  readonly PAGE_SIZE = 10;
  paginaAtual = signal(1);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.filteredTurmas().length / this.PAGE_SIZE)));
  turmasPaginadas = computed(() =>
    this.filteredTurmas().slice((this.paginaAtual() - 1) * this.PAGE_SIZE, this.paginaAtual() * this.PAGE_SIZE)
  );

  constructor() {
    effect(() => {
      this.filteredTurmas();
      untracked(() => this.paginaAtual.set(1));
    });
  }

  mudarPagina(p: number) { this.paginaAtual.set(p); }

  toggleMenu(turmaId: number, event: Event) {
    event.stopPropagation();
    this.menuAbertoId.set(this.menuAbertoId() === turmaId ? null : turmaId);
  }

  @HostListener('document:click')
  fecharMenus() {
    this.menuAbertoId.set(null);
  }

  filteredTurmas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filtro = this.activeFilter();
    const filtradas = this.turmas().filter((t) => {
      const matchesTerm = !term || t.nome_turma.toLowerCase().includes(term);
      const matchesFiltro =
        filtro === null ? true :
        filtro === 'cheia' ? this.isCheia(t) :
        filtro === 'sem-professor' ? !t.professor_id :
        filtro === 'com-vagas' ? this.temVagas(t) : true;
      return matchesTerm && matchesFiltro;
    });
    return filtradas.sort((a, b) => a.nome_turma.localeCompare(b.nome_turma));
  });

  toggleFilter(filtro: 'cheia' | 'sem-professor' | 'com-vagas') {
    this.activeFilter.set(this.activeFilter() === filtro ? null : filtro);
  }

  readonly maxAlunos = MAX_ALUNOS_POR_TURMA;

  capacidadeEfetiva(turma: Turma): number {
    return Math.min(turma.capacidade_maxima ?? MAX_ALUNOS_POR_TURMA, MAX_ALUNOS_POR_TURMA);
  }

  isCheia(turma: Turma): boolean {
    return (turma.totalAlunos ?? 0) >= this.capacidadeEfetiva(turma);
  }

  temVagas(turma: Turma): boolean {
    return (turma.totalAlunos ?? 0) < this.capacidadeEfetiva(turma);
  }

  ocupacaoPercentual(turma: Turma): number {
    const percentual = ((turma.totalAlunos ?? 0) / this.capacidadeEfetiva(turma)) * 100;
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
    if (capacity != null && (capacity < 1 || capacity > MAX_ALUNOS_POR_TURMA)) {
      this.actionError.set(`A capacidade deve ser entre 1 e ${MAX_ALUNOS_POR_TURMA} alunos.`);
      return;
    }
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

  pedirExclusaoTurma(turma: Turma) {
    this.actionError.set(null);
    this.turmaParaExcluir.set(turma);
  }

  cancelarExclusaoTurma() {
    if (this.deleteLoading()) return;
    this.turmaParaExcluir.set(null);
  }

  mensagemExclusaoTurma(): string {
    const turma = this.turmaParaExcluir();
    if (!turma) return '';
    const alunos = turma.totalAlunos ?? 0;
    const alunosTexto = alunos > 0
      ? ` ${alunos} aluno(s) ficará(ão) sem turma.`
      : '';
    return `Excluir a turma "${turma.nome_turma}"? Essa ação não pode ser desfeita.${alunosTexto}`;
  }

  async confirmarExclusaoTurma() {
    const turma = this.turmaParaExcluir();
    if (!turma) return;

    this.deleteLoading.set(true);
    this.actionError.set(null);
    try {
      await this.turmaService.deleteTurma(turma.turma_id);
      this.turmaParaExcluir.set(null);
      await this.loadData();
    } catch (err: any) {
      this.turmaParaExcluir.set(null);
      this.actionError.set(err.message || 'Erro ao excluir turma');
    } finally {
      this.deleteLoading.set(false);
    }
  }

  async createTurma() {
    this.actionError.set(null);
    const nome = this.newTurmaNome().trim();
    if (!nome) {
      this.actionError.set('O nome da turma é obrigatório.');
      return;
    }
    const capacidade = this.newTurmaCapacidade();
    if (capacidade != null && (capacidade < 1 || capacidade > MAX_ALUNOS_POR_TURMA)) {
      this.actionError.set(`A capacidade deve ser entre 1 e ${MAX_ALUNOS_POR_TURMA} alunos.`);
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
