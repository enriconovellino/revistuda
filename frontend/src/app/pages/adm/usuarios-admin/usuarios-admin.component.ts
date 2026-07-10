import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TurmaService } from '../../../services/turma.service';
import { MAX_ALUNOS_POR_TURMA, Turma, Usuario } from '../../../model/professor.models';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

type Filtro = 'todos' | 'professor' | 'aluno' | 'pendente';
type TipoAcao = 'aprovar' | 'rejeitar' | 'revogar' | 'excluir';

interface AcaoPendente {
  tipo: TipoAcao;
  usuario: Usuario;
}

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './usuarios-admin.component.html',
  styleUrl: './usuarios-admin.component.scss'
})
export class UsuariosAdminComponent implements OnInit {
  private userService = inject(UserService);
  private turmaService = inject(TurmaService);

  loading = signal<boolean>(false);
  actionLoading = signal<boolean>(false);
  actionError = signal<string | null>(null);

  users = signal<Usuario[]>([]);
  turmas = signal<Turma[]>([]);

  searchTerm = signal<string>('');
  activeFilter = signal<Filtro>('todos');

  acaoPendente = signal<AcaoPendente | null>(null);

  filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filtro = this.activeFilter();

    return this.users().filter((user) => {
      const isProfessor = user.permissions.includes('PROFESSOR');
      const isAluno = user.permissions.includes('ALUNO_IDOSO') || user.permissions.includes('ALUNO_CRIANCA');

      const matchesFiltro =
        filtro === 'todos' ? true :
        filtro === 'professor' ? isProfessor :
        filtro === 'aluno' ? isAluno :
        filtro === 'pendente' ? (isProfessor && !user.approved) : true;

      const matchesTerm = !term || user.nome.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);

      return matchesFiltro && matchesTerm;
    });
  });

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [users, turmas] = await Promise.all([this.userService.getUsers(), this.turmaService.getTurmas()]);
      this.users.set(users);
      this.turmas.set(turmas);
    } finally {
      this.loading.set(false);
    }
  }

  isProfessor(user: Usuario): boolean {
    return user.permissions.includes('PROFESSOR');
  }

  isAluno(user: Usuario): boolean {
    return user.permissions.includes('ALUNO_IDOSO') || user.permissions.includes('ALUNO_CRIANCA');
  }

  turmaNome(turmaId: number | null | undefined): string {
    if (!turmaId) return '—';
    const turma = this.turmas().find((t) => t.turma_id === turmaId);
    return turma ? turma.nome_turma : '—';
  }

  turmasDoProfessor(professorId: number): Turma[] {
    return this.turmas().filter((t) => t.professor_id === professorId);
  }

  // Acima disso, as turmas restantes viram uma etiqueta "+N" com tooltip.
  readonly maxTagsVisiveis = 2;

  turmasVisiveis(professorId: number): Turma[] {
    return this.turmasDoProfessor(professorId).slice(0, this.maxTagsVisiveis);
  }

  turmasExtras(professorId: number): Turma[] {
    return this.turmasDoProfessor(professorId).slice(this.maxTagsVisiveis);
  }

  nomesTurmasExtras(professorId: number): string {
    return this.turmasExtras(professorId).map((t) => t.nome_turma).join(', ');
  }

  turmaCheia(turma: Turma): boolean {
    const limite = Math.min(turma.capacidade_maxima ?? MAX_ALUNOS_POR_TURMA, MAX_ALUNOS_POR_TURMA);
    return (turma.totalAlunos ?? 0) >= limite;
  }

  async moverParaTurma(user: Usuario, valor: string) {
    const turmaId = valor === '' ? null : Number(valor);
    if (turmaId === (user.turmaId ?? null)) return;

    this.actionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.userService.updateUser(user.id, { turma_id: turmaId });
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao mover aluno de turma');
    } finally {
      await this.loadData();
      this.actionLoading.set(false);
    }
  }

  cargoLabel(user: Usuario): string {
    if (user.permissions.includes('ADM')) return 'Administrador';
    if (this.isProfessor(user)) return 'Professor(a)';
    if (this.isAluno(user)) return 'Aluno(a)';
    return 'Usuário';
  }

  pedirAprovacao(user: Usuario) {
    this.actionError.set(null);
    this.acaoPendente.set({ tipo: 'aprovar', usuario: user });
  }

  pedirRejeicao(user: Usuario) {
    this.actionError.set(null);
    this.acaoPendente.set({ tipo: 'rejeitar', usuario: user });
  }

  pedirRevogacao(user: Usuario) {
    this.actionError.set(null);
    this.acaoPendente.set({ tipo: 'revogar', usuario: user });
  }

  pedirExclusao(user: Usuario) {
    this.actionError.set(null);
    this.acaoPendente.set({ tipo: 'excluir', usuario: user });
  }

  dialogTitle(): string {
    const acao = this.acaoPendente();
    if (!acao) return '';
    if (acao.tipo === 'aprovar') return 'Aprovar cadastro';
    if (acao.tipo === 'rejeitar') return 'Rejeitar cadastro';
    if (acao.tipo === 'excluir') return 'Excluir aluno';
    return 'Revogar acesso';
  }

  dialogMessage(): string {
    const acao = this.acaoPendente();
    if (!acao) return '';
    const nome = acao.usuario.nome;

    if (acao.tipo === 'aprovar') {
      return `Aprovar o cadastro de ${nome}? Ela(e) poderá fazer login como professor(a) imediatamente.`;
    }
    if (acao.tipo === 'rejeitar') {
      return `Rejeitar e excluir o cadastro de ${nome}? Essa ação não pode ser desfeita.`;
    }
    if (acao.tipo === 'excluir') {
      return `Excluir permanentemente a conta de ${nome}? Todo o histórico de respostas dela(e) será apagado. Essa ação não pode ser desfeita.`;
    }

    const turmas = this.turmasDoProfessor(acao.usuario.id);
    const turmasTexto = turmas.length > 0
      ? ` ${turmas.length} turma(s) (${turmas.map((t) => t.nome_turma).join(', ')}) ficará(ão) sem professor.`
      : '';
    return `Revogar o acesso de ${nome}? Ela(e) não conseguirá mais fazer login.${turmasTexto}`;
  }

  dialogConfirmLabel(): string {
    const acao = this.acaoPendente();
    if (!acao) return 'Confirmar';
    if (acao.tipo === 'aprovar') return 'Aprovar';
    if (acao.tipo === 'rejeitar') return 'Rejeitar';
    if (acao.tipo === 'excluir') return 'Excluir';
    return 'Revogar acesso';
  }

  dialogVariant(): 'primary' | 'danger' {
    return this.acaoPendente()?.tipo === 'aprovar' ? 'primary' : 'danger';
  }

  cancelarAcao() {
    if (this.actionLoading()) return;
    this.acaoPendente.set(null);
  }

  async confirmarAcao() {
    const acao = this.acaoPendente();
    if (!acao) return;

    this.actionLoading.set(true);
    this.actionError.set(null);
    try {
      if (acao.tipo === 'aprovar') {
        await this.userService.approveUser(acao.usuario.id);
      } else if (acao.tipo === 'rejeitar') {
        await this.userService.rejectUser(acao.usuario.id);
      } else if (acao.tipo === 'excluir') {
        await this.userService.deleteUser(acao.usuario.id);
      } else {
        await this.userService.revokeProfessorAccess(acao.usuario.id);
      }
      this.acaoPendente.set(null);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao executar ação');
    } finally {
      this.actionLoading.set(false);
    }
  }
}
