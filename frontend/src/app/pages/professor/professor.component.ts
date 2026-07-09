import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Modulo, Turma, Usuario } from '../../model/professor.models';
import { ProfessorService } from '../../services/professor.service';
import { DashboardTurmas } from './dashboard-turmas/dashboard-turmas';
import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardTurmas, EditarPerfilComponent],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.scss',
})
export class ProfessorComponent implements OnInit {
  userName = signal<string>('Professor');
  isEditProfileOpen = signal<boolean>(false);
  modulos = signal<Modulo[]>([]);
  modulosDaTurmaSelecionada = computed<Modulo[]>(() => {
    const turma = this.turmaSelecionada();
    if (!turma) {
      return [];
    }

    return this.modulos().filter((modulo) => modulo.turma_id === turma.turma_id);
  });
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  paginaAtual = signal<string>('dashboard');
  turmaSelecionada = signal<Turma | null>(null);
  mostrarFormModulo = signal<boolean>(false);
  salvandoModulo = signal<boolean>(false);
  erroModulo = signal<string | null>(null);
  moduloEmEdicao = signal<Modulo | null>(null);

  novoTituloModulo = '';
  novaDescricaoModulo = '';
  novaDificuldadeModulo = 'fácil';
  novaImagemUrl = '';

  userId: number | null = null;

  constructor(
    private router: Router,
    private professorService: ProfessorService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: Usuario = JSON.parse(userStr);
        this.userName.set(user.nome);
        this.userId = user.id;
      }
    }
    await this.carregarDados();

    this.route.queryParams.subscribe(async params => {
      const tab = params['tab'];
      const turmaId = params['turmaId'];
      if (tab) {
        this.paginaAtual.set(tab);
      }
      if (turmaId && this.userId) {
        try {
          const turmas = await this.professorService.getTurmasByProfessor(this.userId);
          const selected = turmas.find(t => t.turma_id === Number(turmaId));
          if (selected) {
            this.turmaSelecionada.set(selected);
          }
        } catch (e) {
          console.error('Erro ao recuperar turma selecionada:', e);
        }
      }
    });
  }

  async carregarDados() {
    try {
      this.loading.set(true);
      const modulos = await this.professorService.getModulos();
      this.modulos.set(modulos);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  irPara(pagina: string) {
    if (pagina !== 'modulos') {
      this.resetarFormularioModulo();
    }
    this.paginaAtual.set(pagina);
  }

  irParaTurmas() {
    this.resetarFormularioModulo();
    this.turmaSelecionada.set(null);
    this.paginaAtual.set('turmas');
  }

  selecionarTurma(turma: Turma) {
    this.resetarFormularioModulo();
    this.turmaSelecionada.set(turma);
    this.paginaAtual.set('modulos');
  }

  contarDificuldade(dificuldade: string): number {
    return this.modulos().filter((m) => m.dificuldade === dificuldade).length;
  }

  toggleFormModulo() {
    if (this.mostrarFormModulo()) {
      this.resetarFormularioModulo();
      return;
    }

    if (!this.turmaSelecionada()) {
      this.irParaTurmas();
      return;
    }

    this.moduloEmEdicao.set(null);
    this.erroModulo.set(null);
    this.limparCamposModulo();
    this.mostrarFormModulo.set(true);
  }

  editarModulo(modulo: Modulo) {
    this.moduloEmEdicao.set(modulo);
    this.novoTituloModulo = modulo.titulo_modulo;
    this.novaDescricaoModulo = modulo.descricao_modulo || '';
    this.novaDificuldadeModulo = modulo.dificuldade;
    this.novaImagemUrl = modulo.imagem_url || '';
    this.mostrarFormModulo.set(true);
    this.paginaAtual.set('modulos');
  }

  async salvarModulo() {
    if (!this.novoTituloModulo.trim()) {
      this.erroModulo.set('Título do módulo é obrigatório');
      return;
    }

    const turma = this.turmaSelecionada();
    if (!turma) {
      this.erroModulo.set('Selecione uma turma antes de salvar o módulo.');
      return;
    }

    try {
      this.salvandoModulo.set(true);
      this.erroModulo.set(null);

      const dados = {
        titulo_modulo: this.novoTituloModulo,
        descricao_modulo: this.novaDescricaoModulo || undefined,
        dificuldade: this.novaDificuldadeModulo,
        imagem_url: this.novaImagemUrl || undefined,
        turma_id: turma.turma_id,
      };

      if (this.moduloEmEdicao()) {
        const atualizado = await this.professorService.updateModulo(
          this.moduloEmEdicao()!.modulo_id,
          dados,
        );
        this.modulos.update((lista) =>
          lista.map((modulo) =>
            modulo.modulo_id === atualizado.modulo_id ? atualizado : modulo,
          ),
        );
        this.moduloEmEdicao.set(null);
      } else {
        const modulo = await this.professorService.createModulo(dados);
        this.modulos.update((lista) => [...lista, modulo]);
      }

      this.resetarFormularioModulo();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar módulo';
      this.erroModulo.set(message);
    } finally {
      this.salvandoModulo.set(false);
    }
  }

  async deletarModulo(id: number) {
    if (!confirm('Tem certeza que deseja deletar este módulo?')) {
      return;
    }

    try {
      await this.professorService.deleteModulo(Number(id));
      this.modulos.update((lista) =>
        lista.filter((modulo) => modulo.modulo_id !== Number(id)),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar módulo';
      alert(message);
    }
  }

  verModulo(id: number) {
    this.router.navigate(['/professor/modulo', id]);
  }

  abrirEditarPerfil() {
    this.isEditProfileOpen.set(true);
  }

  fecharEditarPerfil() {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: any) {
    this.userName.set(updatedUser.nome);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }

  private limparCamposModulo() {
    this.novoTituloModulo = '';
    this.novaDescricaoModulo = '';
    this.novaDificuldadeModulo = 'fácil';
    this.novaImagemUrl = '';
  }

  private resetarFormularioModulo() {
    this.mostrarFormModulo.set(false);
    this.moduloEmEdicao.set(null);
    this.erroModulo.set(null);
    this.limparCamposModulo();
  }
}
