import { Component, OnInit, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Modulo } from '../../../model/modulo.model';
import { Turma } from '../../../model/turma.model';
import { ProfessorService } from '../../../services/professor.service';
import { ModuloService } from '../../../services/modulo.service';
import { environment } from '../../../../environments/environment';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';

@Component({
  selector: 'app-modulos-professor',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent],
  templateUrl: './modulos.component.html',
  styleUrl: './modulos.component.scss',
})
export class ModulosProfessorComponent implements OnInit {
  turma: Turma | null = null;

  modulos = signal<Modulo[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  modulosDaTurma = computed<Modulo[]>(() => {
    const t = this.turma;
    if (!t) return [];
    return this.modulos().filter((m) => m.turma_id === t.turma_id);
  });

  paginaAtual = signal<number>(1);
  itensPorPagina = signal<number>(6);

  totalPaginas = computed(() => {
    const total = this.modulosDaTurma().length;
    return Math.ceil(total / this.itensPorPagina()) || 1;
  });

  modulosPaginados = computed(() => {
    const start = (this.paginaAtual() - 1) * this.itensPorPagina();
    const end = start + this.itensPorPagina();
    return this.modulosDaTurma().slice(start, end);
  });

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
    }
  }

  mostrarFormModulo = signal<boolean>(false);
  salvandoModulo = signal<boolean>(false);
  erroModulo = signal<string | null>(null);
  moduloEmEdicao = signal<Modulo | null>(null);
  uploadingImage = signal<boolean>(false);

  novoTituloModulo = '';
  novaDescricaoModulo = '';
  novaDificuldadeModulo = 'fácil';
  novaImagemUrl = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private professorService = inject(ProfessorService);
  private moduloService = inject(ModuloService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      const turmaId = params['turmaId'];
      if (turmaId) {
        await this.carregarTurmaSelecionada(Number(turmaId));
      } else {
        this.turma = null;
      }
    });
  }

  async carregarTurmaSelecionada(turmaId: number) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      this.loading.set(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const turmas = await this.professorService.getTurmasByProfessor(user.id);
      const selected = turmas.find((t) => t.turma_id === turmaId);
      if (selected) {
        this.turma = selected;
        this.resetarFormularioModulo();
        await this.carregarModulos();
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async carregarModulos() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const modulos = await this.moduloService.getModulos();
      this.modulos.set(modulos);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar módulos';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  irParaTurmas() {
    this.resetarFormularioModulo();
    this.router.navigate(['/professor/turmas']);
  }

  toggleFormModulo() {
    if (this.mostrarFormModulo()) {
      this.resetarFormularioModulo();
      return;
    }

    if (!this.turma) {
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
  }

  async salvarModulo() {
    if (!this.novoTituloModulo.trim()) {
      this.erroModulo.set('Título do módulo é obrigatório');
      return;
    }

    if (!this.turma) {
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
        turma_id: this.turma.turma_id,
      };

      if (this.moduloEmEdicao()) {
        const atualizado = await this.moduloService.updateModulo(
          this.moduloEmEdicao()!.modulo_id,
          dados,
        );
        this.modulos.update((lista) =>
          lista.map((m) => (m.modulo_id === atualizado.modulo_id ? atualizado : m)),
        );
        this.moduloEmEdicao.set(null);
      } else {
        const modulo = await this.moduloService.createModulo(dados);
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
      await this.moduloService.deleteModulo(Number(id));
      this.modulos.update((lista) => lista.filter((m) => m.modulo_id !== Number(id)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar módulo';
      alert(message);
    }
  }

  verModulo(id: number) {
    this.router.navigate(['/professor/modulo', id]);
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    try {
      this.uploadingImage.set(true);
      this.erroModulo.set(null);
      const res = await this.professorService.uploadImage(file);
      this.novaImagemUrl = res.url;
    } catch (err: any) {
      this.erroModulo.set(err.message || 'Erro ao enviar imagem');
    } finally {
      this.uploadingImage.set(false);
    }
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
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