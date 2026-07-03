import { Component, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService } from '../../services/professor.service';
import { Modulo, Turma, Usuario } from '../../model/professor.models';
import { DashboardTurmasComponent } from './dashboard-turmas/dashboard-turmas.component';
@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardTurmasComponent],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.scss'
})
export class ProfessorComponent implements OnInit {
  
  userName = signal<string>('Professor');
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
 
  constructor(
    private router: Router,
    private professorService: ProfessorService
  ) {}
 
  async ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: Usuario = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
    await this.carregarDados();
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
 
  contarDificuldade(dificuldade: string): number {
    return this.modulos().filter(m => m.dificuldade === dificuldade).length;
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
    this.irPara('modulos');
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
        const atualizado = await this.professorService.updateModulo(this.moduloEmEdicao()!.modulo_id, dados);
        this.modulos.update(m => m.map(m => m.modulo_id === atualizado.modulo_id ? atualizado : m));
        this.moduloEmEdicao.set(null);
      } else {
        const modulo = await this.professorService.createModulo(dados);
        this.modulos.update(m => [...m, modulo]);
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
    if (!confirm('Tem certeza que deseja deletar este módulo?')) return;
    try {
      await this.professorService.deleteModulo(Number(id));
      this.modulos.update((lista: Modulo[]) => lista.filter((m: Modulo) => m.modulo_id !== Number(id)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar módulo';
      alert(message);
    }
  }
 
  verModulo(id: number) {
    this.router.navigate(['/professor/modulo', id]);
  }
 
  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/auth']);
  }

  selecionarTurma(turma: Turma) {
    this.resetarFormularioModulo();
    this.turmaSelecionada.set(turma);
    this.paginaAtual.set('modulos');
  }

  irParaTurmas() {
    this.resetarFormularioModulo();
    this.turmaSelecionada.set(null);
    this.paginaAtual.set('turmas');
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