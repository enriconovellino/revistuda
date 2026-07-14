import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AtividadeService } from '../../../services/atividade.service';
import { AlunoService } from '../../../services/aluno.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { Atividade } from '../../../model/atividade.model';
import { Licao } from '../../../model/aluno.model';
import { LicaoService } from '../../../services/licao.service';
import { ComentarioAlunoProfessor } from '../../../model/professor.models';

import { TutorialService } from '../../../services/tutorial.service';

@Component({
  selector: 'app-atividades-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atividades.component.html',
  styleUrl: './atividades.component.scss'
})
export class AtividadesIdosoComponent implements OnInit {
  public tutorialService = inject(TutorialService);

  proximoPassoTutorial() {
    this.tutorialService.avancarAtividades();
  }

  iniciarTutorialAtividades() {
    this.tutorialService.active.set(true);
    this.tutorialService.step.set('atividadesLista');
  }

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  atividades = signal<Atividade[]>([]);
  moduloId = signal<number | null>(null);

  /** Comentário do aluno (com resposta do professor, se houver) por atividade_id */
  comentariosPorAtividade = signal<{ [atividadeId: number]: ComentarioAlunoProfessor }>({});

  readonly ITENS_POR_PAGINA = 5;
  paginaAtual = signal<number>(1);

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.atividades().length / this.ITENS_POR_PAGINA));
  }

  get atividadesPaginadas(): Atividade[] {
    const inicio = (this.paginaAtual() - 1) * this.ITENS_POR_PAGINA;
    return this.atividades().slice(inicio, inicio + this.ITENS_POR_PAGINA);
  }

  constructor(
    private atividadeService: AtividadeService,
    private router: Router,
    private route: ActivatedRoute,
    private licaoService: LicaoService,
    private conteudoService: ConteudoService,
    private alunoService: AlunoService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const moduloIdParam = params.get('moduloId');
      this.moduloId.set(moduloIdParam ? Number(moduloIdParam) : null);
      this.loadData();
    });
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const [todasAtividades, todasLicoes, todosConteudos] = await Promise.all([
        this.atividadeService.getAtividades(),
        this.licaoService.getLicoes(),
        this.conteudoService.getConteudos()
      ]);

      const moduloId = this.moduloId();
      let atividadesFinais: Atividade[];

      if (moduloId !== null) {
        const licaoIdsDoModulo = new Set(
          todasLicoes.filter((l: Licao) => l.modulo_id === moduloId).map((l: Licao) => l.licao_id)
        );
        atividadesFinais = todasAtividades.filter(a => licaoIdsDoModulo.has(a.licao_id));
        this.atividades.set(atividadesFinais);

        // Se só tiver uma atividade nesse módulo, abre ela direto
        if (atividadesFinais.length === 1) {
          this.fazerAtividade(atividadesFinais[0].atividade_id);
          return;
        }
      } else {
        atividadesFinais = todasAtividades;
        this.atividades.set(atividadesFinais);
      }

      await this.carregarComentarios(atividadesFinais, todosConteudos);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar atividades:', message);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
      this.paginaAtual.set(1); // reset ao recarregar
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual() > 1) this.paginaAtual.update(p => p - 1);
  }

  proximaPagina(): void {
    if (this.paginaAtual() < this.totalPaginas) this.paginaAtual.update(p => p + 1);
  }

  private async carregarComentarios(atividades: Atividade[], todosConteudos: { conteudo_id: number; licao_id: number }[]): Promise<void> {
    // Mapeia licao_id -> conteudo_ids
    const conteudoIdsPorLicao: { [licaoId: number]: number[] } = {};
    todosConteudos.forEach(c => {
      if (!conteudoIdsPorLicao[c.licao_id]) conteudoIdsPorLicao[c.licao_id] = [];
      conteudoIdsPorLicao[c.licao_id].push(c.conteudo_id);
    });

    const todosConteudoIds = [...new Set(todosConteudos.map(c => c.conteudo_id))];
    const comentariosCompletos = await this.alunoService.getComentariosCompletosDoAluno(todosConteudoIds);

    const resultado: { [atividadeId: number]: ComentarioAlunoProfessor } = {};

    atividades.forEach(atv => {
      const conteudoIds = conteudoIdsPorLicao[atv.licao_id] ?? [];
      // Pega o primeiro comentário encontrado entre os conteúdos da lição dessa atividade
      for (const conteudoId of conteudoIds) {
        if (comentariosCompletos[conteudoId]) {
          resultado[atv.atividade_id] = comentariosCompletos[conteudoId];
          break;
        }
      }
    });

    this.comentariosPorAtividade.set(resultado);
  }

  getComentarioDaAtividade(atividadeId: number): ComentarioAlunoProfessor | null {
    return this.comentariosPorAtividade()[atividadeId] ?? null;
  }

  getTipoAtividadeLabel(tipo: string): string {
    const map: Record<string, string> = {
      'multipla_escolha': 'Múltipla Escolha',
      'associacao_imagens': 'Associação de Imagens'
    };
    return map[tipo] ?? tipo;
  }

  fazerAtividade(atividadeId: number): void {
    this.router.navigate(['/aluno-idoso/atividade', atividadeId]);
  }
}