import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { AtividadeService } from '../../../services/atividade.service';
import { AlunoService } from '../../../services/aluno.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { Atividade } from '../../../model/atividade.model';

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

  visaoDominio = signal<VisaoDominio>('modulos');

  moduloAtual = computed<Modulo | null>(() => this.modulos()[0] ?? null);

  /** Somente atividades a fazer ou em andamento */
  atividadesPendentes = computed<Atividade[]>(() =>
    this.atividades().filter(a => a.status === 'a_fazer' || a.status === 'fazendo')
  );

  /** % de lições concluídas em todos os módulos do aluno */
  desempenhoModulos = computed<number>(() => {
    const modulos = this.modulos();
    const licoes = this.licoes();

    if (modulos.length === 0 || licoes.length === 0) return 0;

    let totalLicoes = 0;
    let totalConcluidas = 0;

    for (const modulo of modulos) {
      const licoesDoModulo = licoes.filter(l => l.modulo_id === modulo.modulo_id);
      const concluidas = this.alunoService.getLicoesConcluidas(modulo.modulo_id);

      totalLicoes += licoesDoModulo.length;
      totalConcluidas += licoesDoModulo.filter(l => concluidas.includes(l.licao_id)).length;
    }

    return totalLicoes > 0 ? Math.round((totalConcluidas / totalLicoes) * 100) : 0;
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
    private alunoService: AlunoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const [modulos, atividades, licoes] = await Promise.all([
        this.moduloService.getModulos(),
        this.atividadeService.getAtividades(),
        this.licaoService.getLicoes()
      ]);

      this.modulos.set(modulos);
      this.atividades.set(atividades);
      this.licoes.set(licoes);
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
    const modulo = this.moduloAtual();
    if (modulo) {
      this.router.navigate(['/aluno-idoso/modulo', modulo.modulo_id]);
    }
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