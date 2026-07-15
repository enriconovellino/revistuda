import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { ComentarioResumoProfessor } from '../../../model/professor.models';
import { StatCardComponent } from '../../../components/stat-card/stat-card.component';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-comentarios-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent],
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.css',
})
export class ComentariosAlunosComponent implements OnInit {
  userName = signal<string>('Professor');

  comentarios = signal<ComentarioResumoProfessor[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  turmaFiltro = signal<number | null>(null);
  moduloFiltro = signal<number | null>(null);

  // --- Resposta a comentário ---
  respostaAbertaId = signal<number | null>(null);
  respostaTexto = '';
  enviandoResposta = signal<boolean>(false);
  respostaError = signal<string | null>(null);

  private professorService = inject(ProfessorService);
  private router = inject(Router);

  turmasDisponiveis = computed(() => {
    const mapa = new Map<number, string>();
    this.comentarios().forEach(c => mapa.set(c.turma.turma_id, c.turma.nome_turma));
    return Array.from(mapa.entries()).map(([turma_id, nome_turma]) => ({ turma_id, nome_turma }));
  });

  modulosDisponiveis = computed(() => {
    const turmaId = this.turmaFiltro();
    const mapa = new Map<number, string>();
    this.comentarios()
      .filter(c => turmaId === null || c.turma.turma_id === turmaId)
      .forEach(c => mapa.set(c.modulo.modulo_id, c.modulo.titulo_modulo));
    return Array.from(mapa.entries()).map(([modulo_id, titulo_modulo]) => ({ modulo_id, titulo_modulo }));
  });

  comentariosFiltrados = computed(() => {
    const turmaId = this.turmaFiltro();
    const moduloId = this.moduloFiltro();
    return this.comentarios().filter(c => {
      if (turmaId !== null && c.turma.turma_id !== turmaId) return false;
      if (moduloId !== null && c.modulo.modulo_id !== moduloId) return false;
      return true;
    });
  });

  itensPorPagina = 4;
  paginaAtualLista = signal<number>(1);

  comentariosPaginados = computed(() => {
    const inicio = (this.paginaAtualLista() - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.comentariosFiltrados().slice(inicio, fim);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.comentariosFiltrados().length / this.itensPorPagina);
  });

  proximaPagina() {
    if (this.paginaAtualLista() < this.totalPaginas()) {
      this.paginaAtualLista.update(p => p + 1);
    }
  }

  paginaAnterior() {
    if (this.paginaAtualLista() > 1) {
      this.paginaAtualLista.update(p => p - 1);
    }
  }

  totalComentarios = computed(() => this.comentarios().length);
  totalAlunosUnicos = computed(() => new Set(this.comentarios().map(c => c.aluno.id)).size);
  totalModulosComComentario = computed(() => new Set(this.comentarios().map(c => c.modulo.modulo_id)).size);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
    this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const comentarios = await this.professorService.getComentariosGerais();
      this.comentarios.set(comentarios);
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao carregar os comentários dos alunos.'));
    } finally {
      this.loading.set(false);
    }
  }

  onTurmaChange(value: string) {
    this.turmaFiltro.set(value ? Number(value) : null);
    this.moduloFiltro.set(null);
    this.paginaAtualLista.set(1);
  }

  onModuloChange(value: string) {
    this.moduloFiltro.set(value ? Number(value) : null);
    this.paginaAtualLista.set(1);
  }

  limparFiltros() {
    this.turmaFiltro.set(null);
    this.moduloFiltro.set(null);
    this.paginaAtualLista.set(1);
  }

  // --- Iniciais do aluno (avatar) ---
  getIniciais(nome: string): string {
    if (!nome) return '?';
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  // --- Responder comentário ---

  toggleResposta(comentarioId: number) {
    if (this.respostaAbertaId() === comentarioId) {
      this.respostaAbertaId.set(null);
      this.respostaTexto = '';
      this.respostaError.set(null);
    } else {
      this.respostaAbertaId.set(comentarioId);
      this.respostaTexto = '';
      this.respostaError.set(null);
    }
  }

  async enviarResposta(comentario: ComentarioResumoProfessor) {
    this.respostaError.set(null);

    if (!this.respostaTexto.trim()) {
      this.respostaError.set('Escreva algo antes de enviar.');
      return;
    }

    try {
      this.enviandoResposta.set(true);
      await this.professorService.responderComentario(comentario.id, this.respostaTexto.trim());

      this.respostaAbertaId.set(null);
      this.respostaTexto = '';
      await this.loadData();
    } catch (err: unknown) {
      this.respostaError.set(getErrorMessage(err, 'Erro ao enviar a resposta.'));
    } finally {
      this.enviandoResposta.set(false);
    }
  }

  voltar() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
  }

  irParaDashboard() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'dashboard' } });
  }

  irParaTurmas() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
  }

  paginaAtual() {
    return 'comentarios';
  }

  irPara(pagina: string) {
    switch (pagina) {
      case 'dashboard':
        this.irParaDashboard();
        break;

      case 'turmas':
        this.irParaTurmas();
        break;

      case 'alunos':
        this.irParaAlunos();
        break;

      case 'comentarios':
        this.irParaComentarios();
        break;
    }
  }

  irParaComentarios() {
    this.router.navigate(['/professor/comentarios']);
  }

  irParaAlunos() {
    this.router.navigate(['/professor/alunos']);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
