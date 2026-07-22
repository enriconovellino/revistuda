import { Component, OnInit, computed, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TurmaService } from '../../../services/turma.service';
import { AuthService } from '../../../services/auth.service';
import { MAX_ALUNOS_POR_TURMA, Usuario } from '../../../model/professor.models';
import { Turma } from '../../../model/turma.model';
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
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosAdminComponent implements OnInit {
  private userService = inject(UserService);
  private turmaService = inject(TurmaService);
  private authService = inject(AuthService);

  loading = signal<boolean>(false);
  actionLoading = signal<boolean>(false);
  actionError = signal<string | null>(null);

  // Signals para a modal de criação de usuário
  showCreateModal = signal<boolean>(false);
  novoUsuarioNome = signal<string>('');
  novoUsuarioEmail = signal<string>('');
  novoUsuarioSenha = signal<string>('');
  novoUsuarioPermission = signal<string>('ALUNO_IDOSO');
  novoUsuarioAprovado = signal<boolean>(true);
  createError = signal<string | null>(null);
  createLoading = signal<boolean>(false);

  users = signal<Usuario[]>([]);
  turmas = signal<Turma[]>([]);

  searchTerm = signal<string>('');
  activeFilter = signal<Filtro>('todos');

  acaoPendente = signal<AcaoPendente | null>(null);

  filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filtro = this.activeFilter();

    const filtrados = this.users().filter((user) => {
      const isProfessor = user.permissions.includes('PROFESSOR');
      const isAluno = user.permissions.includes('ALUNO_IDOSO') || user.permissions.includes('ALUNO_CRIANCA');

      const matchesFiltro =
        filtro === 'todos' ? true :
        filtro === 'professor' ? isProfessor :
        filtro === 'aluno' ? isAluno :
        filtro === 'pendente' ? !user.approved : true;

      const matchesTerm = !term || user.nome.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);

      return matchesFiltro && matchesTerm;
    });
    return filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly PAGE_SIZE = 5;
  paginaAtual = signal(1);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.PAGE_SIZE)));
  usuariosPaginados = computed(() =>
    this.filteredUsers().slice((this.paginaAtual() - 1) * this.PAGE_SIZE, this.paginaAtual() * this.PAGE_SIZE)
  );

  constructor() {
    effect(() => {
      this.searchTerm();
      this.activeFilter();
      untracked(() => this.paginaAtual.set(1));
    });
  }

  totalAlunos = computed(() => this.users().filter(u => this.isAluno(u)).length);
  totalProfessores = computed(() => this.users().filter(u => this.isProfessor(u)).length);
  totalPendentes = computed(() => this.users().filter(u => !u.approved).length);
  totalUsuarios = computed(() => this.users().length);
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  alunoSendoEditado = signal<number | null>(null);

  getIniciais(nome: string): string {
    if (!nome) return '';
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].slice(0, 2).toUpperCase();
  }

  alternarEdicao(userId: number) {
    if (this.alunoSendoEditado() === userId) {
      this.alunoSendoEditado.set(null);
    } else {
      this.alunoSendoEditado.set(userId);
    }
  }

  mudarPagina(p: number) { this.paginaAtual.set(p); }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData(showLoader: boolean = true) {
    if (showLoader) {
      this.loading.set(true);
    }
    try {
      const [users, turmas] = await Promise.all([this.userService.getUsers(), this.turmaService.getTurmas()]);
      this.users.set(users);
      this.turmas.set(turmas);
    } finally {
      if (showLoader) {
        this.loading.set(false);
      }
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
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Erro ao mover aluno de turma');
    } finally {
      await this.loadData(false);
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
      const cargo = this.isProfessor(acao.usuario) ? 'professor(a)' : 'administrador(a)';
      return `Aprovar o cadastro de ${nome}? Ela(e) poderá fazer login como ${cargo} imediatamente.`;
    }
    if (acao.tipo === 'rejeitar') {
      return `Rejeitar o cadastro de ${nome}? O acesso dela(e) continuará bloqueado e o status será marcado como Recusado.`;
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
      await this.loadData(false);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Erro ao executar ação');
    } finally {
      this.actionLoading.set(false);
    }
  }

  abrirModalCriarUsuario() {
    this.createError.set(null);
    this.novoUsuarioNome.set('');
    this.novoUsuarioEmail.set('');
    this.novoUsuarioSenha.set('');
    this.novoUsuarioPermission.set('ALUNO_IDOSO');
    this.novoUsuarioAprovado.set(true);
    this.showCreateModal.set(true);
  }

  fecharModalCriarUsuario() {
    if (this.createLoading()) return;
    this.showCreateModal.set(false);
    this.createError.set(null);
  }

  async criarUsuario() {
    if (this.createLoading()) return;

    const nome = this.novoUsuarioNome().trim();
    const email = this.novoUsuarioEmail().trim();
    const senha = this.novoUsuarioSenha().trim();
    const permission = this.novoUsuarioPermission();

    if (!nome || !email || !senha) {
      this.createError.set('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      this.createError.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);

    try {
      const res = await this.authService.register({
        nome,
        email,
        senha,
        permission
      });

      // Se foi solicitado aprovação imediata e o usuário criado necessita de aprovação
      if (this.novoUsuarioAprovado() && res.user && !res.user.approved) {
        await this.userService.approveUser(res.user.id);
      }

      // Fechar modal e recarregar dados do grid
      this.showCreateModal.set(false);
      await this.loadData(false);
    } catch (err) {
      this.createError.set(err instanceof Error ? err.message : 'Erro ao cadastrar usuário.');
    } finally {
      this.createLoading.set(false);
    }
  }
}