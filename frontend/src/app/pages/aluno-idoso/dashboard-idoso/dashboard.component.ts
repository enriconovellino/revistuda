import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { AtividadeService } from '../../../services/atividade.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { Atividade } from '../../../model/atividade.model';

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

  progressoLeitura = signal<number>(0);
  progressoVideos = signal<number>(0);

  moduloAtual = computed<Modulo | null>(() => this.modulos()[0] ?? null);

  dominioGeral = computed<number>(() => {
    const leitura = this.progressoLeitura();
    const atividades = this.progressoVideos();
    return Math.round((leitura + atividades) / 2);
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

  retomarAula(): void {
    const modulo = this.moduloAtual();
    if (modulo) {
      this.router.navigate(['/aluno-idoso/modulo', modulo.modulo_id]);
    }
  }

  irParaCursos(): void {
    // Vai direto para a tela de listagem "Meus Cursos / Módulos"
    this.router.navigate(['/aluno-idoso/modulos']);
  }

  fazerAtividade(atividadeId: number): void {
    this.router.navigate(['/aluno-idoso/atividade', atividadeId]);
  }

  irParaTarefas(): void {
    // Vai direto para a tela de listagem "Minhas Tarefas / Atividades"
    this.router.navigate(['/aluno-idoso/atividades']);
  }
}