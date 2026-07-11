import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Modulo } from '../../../model/modulo.model';
import { Turma } from '../../../model/turma.model';
import { ProfessorService } from '../../../services/professor.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard-modulos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-modulos.component.html',
  styleUrl: './dashboard-modulos.component.scss',
})
export class DashboardModulosComponent implements OnChanges {
  
  @Input() turma: Turma | null = null;


  @Output() voltar = new EventEmitter<void>();

  modulos = signal<Modulo[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  modulosDaTurma = computed<Modulo[]>(() => {
    const turma = this.turma;
    if (!turma) return [];
    return this.modulos().filter((m) => m.turma_id === turma.turma_id);
  });

  mostrarFormModulo = signal<boolean>(false);
  salvandoModulo = signal<boolean>(false);
  erroModulo = signal<string | null>(null);
  moduloEmEdicao = signal<Modulo | null>(null);
  uploadingImage = signal<boolean>(false);

  novoTituloModulo = '';
  novaDescricaoModulo = '';
  novaDificuldadeModulo = 'fácil';
  novaImagemUrl = '';

  constructor(
    private router: Router,
    private professorService: ProfessorService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['turma']) {
      this.resetarFormularioModulo();
      this.carregarModulos();
    }
  }

  async carregarModulos() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const modulos = await this.professorService.getModulos();
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
    this.voltar.emit();
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
        const atualizado = await this.professorService.updateModulo(
          this.moduloEmEdicao()!.modulo_id,
          dados,
        );
        this.modulos.update((lista) =>
          lista.map((m) => (m.modulo_id === atualizado.modulo_id ? atualizado : m)),
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