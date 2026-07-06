import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { TurmaService } from '../../services/turma.service';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adm.component.html',
  styleUrl: './adm.component.scss'
})
export class AdmComponent implements OnInit {
  userName = signal('Administrador');
  pendingProfessors = signal<any[]>([]);
  professors = signal<any[]>([]);
  turmas = signal<any[]>([]);
  currentView = signal<'dashboard' | 'turmas'>('dashboard');
  loading = signal<boolean>(false);
  actionError = signal<string | null>(null);

  // Class creation form state signals
  showCreateForm = signal<boolean>(false);
  newTurmaNome = signal<string>('');
  newTurmaDescricao = signal<string>('');
  newTurmaCapacidade = signal<number | null>(null);
  newTurmaProfessorId = signal<number | null>(null);

  selectedProfessorForTurma: { [key: number]: number } = {};
  selectedCapacityForTurma: { [key: number]: number | null } = {};

  // Computed alert for classes without professors
  turmasSemProfessor = computed(() => {
    return this.turmas().filter(t => !t.professor_id);
  });

  private router = inject(Router);
  private userService = inject(UserService);
  private turmaService = inject(TurmaService);

  async ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const users = await this.userService.getUsers();
      
      const pending = users.filter(user => 
        user.permissions.includes('PROFESSOR') && !user.approved
      );
      this.pendingProfessors.set(pending);

      const approved = users.filter(user => 
        user.permissions.includes('PROFESSOR') && user.approved
      );
      this.professors.set(approved);

      const allTurmas = await this.turmaService.getTurmas();
      this.turmas.set(allTurmas);
      
      allTurmas.forEach(t => {
        this.selectedProfessorForTurma[t.turma_id] = t.professor_id || 0;
        this.selectedCapacityForTurma[t.turma_id] = t.capacidade_maxima || null;
      });
    } catch (err: any) {
      console.error('Erro ao buscar dados do painel do admin', err);
    } finally {
      this.loading.set(false);
    }
  }

  async approveProfessor(id: number) {
    this.actionError.set(null);
    try {
      await this.userService.approveUser(id);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao aprovar professor');
    }
  }

  async rejectProfessor(id: number) {
    this.actionError.set(null);
    try {
      await this.userService.rejectUser(id);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao rejeitar professor');
    }
  }

  onProfessorSelect(turmaId: number, event: any) {
    const profId = Number(event.target.value);
    this.selectedProfessorForTurma[turmaId] = profId;
  }

  onCapacityInput(turmaId: number, event: any) {
    const val = event.target.value === '' ? null : Number(event.target.value);
    this.selectedCapacityForTurma[turmaId] = val;
  }

  onNewTurmaProfessorSelect(event: any) {
    const profId = Number(event.target.value);
    this.newTurmaProfessorId.set(profId === 0 ? null : profId);
  }

  getProfessorName(professorId: number): string {
    const prof = this.professors().find(p => p.id === professorId);
    return prof ? prof.nome : 'Desconhecido';
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
      await this.turmaService.updateTurma(turmaId, {
        professor_id: null
      });
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
      
      // Clear form inputs
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

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/auth']);
  }
}
