import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { AtividadeService } from '../../../services/atividade.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { Atividade } from '../../../model/atividade.model';
import { Conteudo } from '../../../model/conteudo.model';

type VisaoDominio = 'modulos' | 'atividades';

@Component({
  selector: 'app-dashboard-aluno-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardAlunoIdosoComponent implements OnInit {

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  modulos = signal<Modulo[]>([]);
  atividades = signal<Atividade[]>([]);
  licoes = signal<Licao[]>([]);
  conteudos = signal<Conteudo[]>([]);
  conteudosConcluidosIds = signal<number[]>([]);

  visaoDominio = signal<VisaoDominio>('modulos');

  moduloAtual = computed<Modulo | null>(() => this.modulos()[0] ?? null);

  /** Somente atividades a fazer ou em andamento */
  atividadesPendentes = computed<Atividade[]>(() =>
    this.atividades().filter(a => a.status === 'a_fazer' || a.status === 'fazendo')
  );

  /** % de lições concluídas em todos os módulos do aluno */
  desempenhoModulos = computed<number>(() => {
    const licoes = this.licoes();
    const conteudos = this.conteudos();
    const concluidos = this.conteudosConcluidosIds();

    if (licoes.length === 0) return 0;

    // Uma lição é concluída quando todos os seus conteúdos estão em conteudosConcluidosIds
    let totalConcluidas = 0;
    for (const licao of licoes) {
      const conteudosDaLicao = conteudos.filter(c => c.licao_id === licao.licao_id);
      if (
        conteudosDaLicao.length > 0 &&
        conteudosDaLicao.every(c => concluidos.includes(c.conteudo_id))
      ) {
        totalConcluidas++;
      }
    }

    return Math.round((totalConcluidas / licoes.length) * 100);
  });

  /** % de atividades concluídas */
  desempenhoAtividades = computed<number>(() => {
    const atividades = this.atividades();
    if (atividades.length === 0) return 0;

    const concluidas = atividades.filter(a => a.status === 'feito').length;
    return Math.round((concluidas / atividades.length) * 100);
  });

  dominioGeral = computed<number>(() => {
    return this.visaoDominio() === 'modulos'
      ? this.desempenhoModulos()
      : this.desempenhoAtividades();
  });

  circumference = 2 * Math.PI * 70;

  dashOffset = computed<number>(() => {
    const progresso = this.dominioGeral();
    return this.circumference - (progresso / 100) * this.circumference;
  });

  constructor(
    private moduloService: ModuloService,
    private atividadeService: AtividadeService,
    private licaoService: LicaoService,
    private conteudoService: ConteudoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const [modulos, atividades, licoes, conteudos] = await Promise.all([
        this.moduloService.getModulos(),
        this.atividadeService.getAtividades(),
        this.licaoService.getLicoes(),
        this.conteudoService.getConteudos(),
      ]);

      this.modulos.set(modulos);
      this.atividades.set(atividades);
      this.licoes.set(licoes);
      this.conteudos.set(conteudos);

      // Buscar progresso de todos os módulos em paralelo
      if (modulos.length > 0) {
        const todosProgresso = await Promise.all(
          modulos.map(m => this.conteudoService.getProgressoConteudos(m.modulo_id))
        );
        const idsUnicos = [...new Set(todosProgresso.flat())];
        this.conteudosConcluidosIds.set(idsUnicos);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar dados do aluno idoso:', message);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  alternarVisaoDominio(visao: VisaoDominio): void {
    this.visaoDominio.set(visao);
  }

  retomarAula(): void {
    const modulos = this.modulos();
    const licoes = this.licoes();
    const conteudos = this.conteudos();
    const concluidos = this.conteudosConcluidosIds();

    // Percorre cada módulo na ordem e dentro dele cada lição
    // Retorna o primeiro módulo + índice da lição que ainda tem conteúdo pendente
    for (const modulo of modulos) {
      const licoesDoModulo = licoes.filter(l => l.modulo_id === modulo.modulo_id);
      for (let i = 0; i < licoesDoModulo.length; i++) {
        const licao = licoesDoModulo[i];
        const conteudosDaLicao = conteudos.filter(c => c.licao_id === licao.licao_id);
        const todosConcluidosDessaLicao =
          conteudosDaLicao.length > 0 &&
          conteudosDaLicao.every(c => concluidos.includes(c.conteudo_id));

        if (!todosConcluidosDessaLicao) {
          // Navega para o módulo e abre direto na lição correta
          this.router.navigate(['/aluno-idoso/modulo', modulo.modulo_id], {
            queryParams: { licao: i }
          });
          return;
        }
      }
    }

    // Caso todas as lições estejam concluídas, vai para a lista de cursos
    this.router.navigate(['/aluno-idoso/modulos']);
  }

  irParaCursos(): void {
    this.router.navigate(['/aluno-idoso/modulos']);
  }

  fazerAtividade(atividadeId: number): void {
    this.router.navigate(['/aluno-idoso/atividade', atividadeId]);
  }

  irParaTarefas(): void {
    this.router.navigate(['/aluno-idoso/atividades']);
  }
}