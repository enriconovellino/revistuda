import { Component, computed, OnInit, AfterViewInit, signal, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Usuario, EstatisticasProfessor, AlunoProfessor } from '../../../model/professor.models';
import { Modulo } from '../../../model/modulo.model';
import { ProfessorService } from '../../../services/professor.service';
import { ModuloService } from '../../../services/modulo.service';
import { environment } from '../../../../environments/environment';
import { StatCardComponent } from '../../../components/stat-card/stat-card.component';
import { AtividadeService } from '../../../services/atividade.service';
import { AtividadeRecente, AtividadeRecenteService } from '../../../services/atividade-recente.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class ProfessorDashboardComponent implements OnInit, AfterViewInit {
  modulos = signal<Modulo[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  estatisticas = signal<EstatisticasProfessor>({
    totalTurmas: 0,
    totalAlunos: 0,
    totalRespostas: 0,
    acertos: 0,
    erros: 0,
    naoRespondeu: 0,
  });

  alunos = signal<AlunoProfessor[]>([]);

  taxaAcertos = computed(() => {
    const stats = this.estatisticas();
    const total = stats.acertos + stats.erros;
    if (total === 0) return 0;
    return Math.round((stats.acertos / total) * 100);
  });

  proximasAtividades = signal<{ data: string; mes: string; titulo: string; info: string }[]>([]);

  // Feed "Atividades dos alunos": igual ao feed do painel admin, mas
  // restrito às atividades (conclusões, comentários) dos alunos das
  // turmas deste professor.
  atividadesAlunos = signal<AtividadeRecente[]>([]);
  private readonly atividadesAlunosRecolhidas = 10;
  mostrarTodasAtividadesAlunos = signal<boolean>(false);
  filtroAtividadesAluno = signal<string>('todas');

  atividadesAlunosFiltradas = computed(() => {
    const filtro = this.filtroAtividadesAluno();
    let atividades = this.atividadesAlunos();
    if (filtro === 'concluido') {
      atividades = atividades.filter(a => a.tipo === 'atividade_concluida' || a.tipo === 'conteudo_concluido');
    } else if (filtro === 'nao_concluido') {
      atividades = atividades.filter(a => a.tipo !== 'atividade_concluida' && a.tipo !== 'conteudo_concluido');
    }
    return atividades;
  });

  atividadesAlunosVisiveis = computed(() =>
    this.mostrarTodasAtividadesAlunos()
      ? this.atividadesAlunosFiltradas()
      : this.atividadesAlunosFiltradas().slice(0, this.atividadesAlunosRecolhidas)
  );

  atividadesAlunosOcultas = computed(() =>
    Math.max(0, this.atividadesAlunosFiltradas().length - this.atividadesAlunosRecolhidas)
  );

  private graficoChart: Chart | null = null;
  private userId: number | null = null;

  private router = inject(Router);
  private professorService = inject(ProfessorService);
  private moduloService = inject(ModuloService);
  private atividadeService = inject(AtividadeService);
  private atividadeRecenteService = inject(AtividadeRecenteService);
  @Inject(PLATFORM_ID) private platformId = inject(PLATFORM_ID);

  async ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: Usuario = JSON.parse(userStr);
        this.userId = user.id;
      }
    }
    await this.carregarDados();
    if (this.userId) {
      await this.carregarEstatisticas(this.userId);
      try {
        const alunos = await this.professorService.getMeusAlunos();
        this.alunos.set(alunos);
      } catch { /* silencioso */ }
      try {
        const atividades = await this.atividadeRecenteService.getAtividadesRecentesAlunos();
        this.atividadesAlunos.set(atividades);
      } catch { /* silencioso */ }
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.renderizarGrafico();
      }, 150);
    }
  }

  async carregarDados() {
    try {
      this.loading.set(true);
      const modulos = await this.moduloService.getModulos();
      this.modulos.set(modulos);
      await this.carregarAtividades();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  async carregarAtividades() {
    try {
      const atividades = await this.atividadeService.getProximasAtividades();
      const mapeadas = (atividades || []).map(atv => {
        const dateObj = atv.data_criacao ? new Date(atv.data_criacao) : new Date();
        const dia = dateObj.getDate().toString().padStart(2, '0');
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mes = meses[dateObj.getMonth()];
        const horas = dateObj.getHours().toString().padStart(2, '0');
        const minutos = dateObj.getMinutes().toString().padStart(2, '0');
        
        return {
          data: dia,
          mes: mes,
          titulo: atv.titulo_atividade,
          info: `${atv.modulo?.titulo_modulo || 'Geral'} • ${horas}:${minutos}`
        };
      });
      this.proximasAtividades.set(mapeadas.slice(0, 3));
    } catch (err: unknown) {
      console.error('Erro ao carregar atividades do banco:', err);
    }
  }

  async carregarEstatisticas(professorId: number) {
    try {
      const stats = await this.professorService.getEstatisticas(professorId);
      this.estatisticas.set(stats);
      setTimeout(() => {
        this.renderizarGrafico();
      }, 100);
    } catch (err: unknown) {
      console.error('Erro ao carregar estatísticas:', err instanceof Error ? err.message : err);
    }
  }

  private renderizarGrafico() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = document.getElementById('graficoDesempenho') as HTMLCanvasElement | null;
    if (!canvas) {
      console.warn('Canvas graficoDesempenho nao encontrado no DOM. Tentando renderizar novamente em breve.');
      return;
    }

    const stats = this.estatisticas();
    const valores = [stats.acertos, stats.erros, stats.naoRespondeu];

    if (this.graficoChart) {
      this.graficoChart.destroy();
      this.graficoChart = null;
    }

    Chart.register(...registerables);

    this.graficoChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Acertos', 'Erros', 'Não Respondeu'],
        datasets: [
          {
            data: valores,
            backgroundColor: ['#00ba88', '#bf0000', '#94a3b8'],
            borderRadius: 8,
            barThickness: 45,
            categoryPercentage: 1.0,
            barPercentage: 1.0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10 },
        },
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 12, family: 'Inter, sans-serif' },
              color: '#94a3b8',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              stepSize: 1,
              color: '#94a3b8',
              font: { size: 12, family: 'Inter, sans-serif' },
            },
          },
        },
      },
    });
  }

  iconeAtividadeAluno(tipo: string): string {
    switch (tipo) {
      case 'atividade_concluida': return 'fi fi-sr-checkbox';
      case 'comentario_aluno': return 'fi fi-sr-comment-alt';
      case 'conteudo_concluido': return 'fi fi-sr-book';
      default: return 'fi fi-sr-bell';
    }
  }

  getAtividadeColorClass(tipo: string, idx: number): string {
    if (tipo === 'atividade_concluida' || tipo === 'conteudo_concluido') {
      return 'icon-color-success';
    }
    return 'icon-color-' + (idx % 3);
  }

  tempoRelativo(data: string): string {
    const diffMs = Date.now() - new Date(data).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
    return new Date(data).toLocaleDateString('pt-BR');
  }

  verModulo(id: number) {
    this.router.navigate(['/professor/modulo', id]);
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  async baixarRelatorio() {
    const agora = new Date();
    const nomeArquivo = `relatorio-dashboard-${agora.toISOString().slice(0, 10)}.png`;

    // Elemento alvo: o painel principal do dashboard
    const elemento = document.querySelector('.dash-prof') as HTMLElement | null;
    if (!elemento) {
      alert('Não foi possível localizar o conteúdo do dashboard.');
      return;
    }

    try {
      // Import dinâmico para não aumentar o bundle inicial
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(elemento, {
        useCORS: true,
        scale: 2,           // alta resolução
        backgroundColor: '#f8fafc',
        logging: false,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = nomeArquivo;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem do relatório:', err);
      alert('Erro ao gerar a imagem. Verifique o console para detalhes.');
    }
  }
}
