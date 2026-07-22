import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConteudoService } from '../../../services/conteudo.service';
import { AlunoService } from '../../../services/aluno.service';
import { TutorialService } from '../../../services/tutorial.service';
import { ComentarioAlunoProfessor } from '../../../model/professor.models';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-comentarios-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '././comentarios.component.html',
  styleUrl: '././comentarios.component.scss',
})
export class ComentariosIdosoComponent implements OnInit {
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  comentarios = signal<ComentarioAlunoProfessor[]>([]);

  totalComentarios = computed(() => this.comentarios().length);
  totalRespondidos = computed(() => this.comentarios().filter(c => !!c.resposta).length);
  totalPendentes = computed(() => this.comentarios().filter(c => !c.resposta).length);

  readonly ITENS_POR_PAGINA = 5;
  paginaAtual = signal<number>(1);

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.comentarios().length / this.ITENS_POR_PAGINA));
  }

  get comentariosPaginados(): ComentarioAlunoProfessor[] {
    const inicio = (this.paginaAtual() - 1) * this.ITENS_POR_PAGINA;
    return this.comentarios().slice(inicio, inicio + this.ITENS_POR_PAGINA);
  }

  constructor(
    private router: Router,
    private conteudoService: ConteudoService,
    private alunoService: AlunoService,
    public tutorialService: TutorialService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const todosConteudos = await this.conteudoService.getConteudos();
      const todosConteudoIds = [...new Set(todosConteudos.map((c: { conteudo_id: number }) => c.conteudo_id))];

      const comentariosCompletos = await this.alunoService.getComentariosCompletosDoAluno(todosConteudoIds);

      const lista = Object.values(comentariosCompletos)
        .filter((c): c is ComentarioAlunoProfessor => !!c)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      this.comentarios.set(lista);
    } catch (error: unknown) {
      console.error('Erro ao carregar comentários:', getErrorMessage(error, 'Erro desconhecido'));
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
      this.paginaAtual.set(1);
    }
  }

  irParaAtividades(): void {
    this.router.navigate(['/aluno-idoso/atividades']);
  }

  irParaComentarios(): void {
    this.router.navigate(['/aluno-idoso/comentarios']);
  }

  paginaAnterior(): void {
    if (this.paginaAtual() > 1) this.paginaAtual.update(p => p - 1);
  }

  proximaPagina(): void {
    if (this.paginaAtual() < this.totalPaginas) this.paginaAtual.update(p => p + 1);
  }

  iniciarTutorial(): void {
    this.tutorialService.active.set(true);
    this.tutorialService.setStepAndSpeak('comentariosExplicacao');
  }

  proximoPassoTutorial(): void {
    this.tutorialService.avancarComentarios();
  }
}