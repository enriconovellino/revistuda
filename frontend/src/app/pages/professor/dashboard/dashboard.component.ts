import { Component, computed, OnInit, AfterViewInit, signal, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Usuario, EstatisticasProfessor } from '../../../model/professor.models';
import { Modulo } from '../../../model/modulo.model';
import { ProfessorService } from '../../../services/professor.service';
import { ModuloService } from '../../../services/modulo.service';
import { environment } from '../../../../environments/environment';
import { StatCardComponent } from '../../../components/stat-card/stat-card.component';
import { AtividadeService } from '../../../services/atividade.service';

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

  proximasAtividades = signal<{ data: string; mes: string; titulo: string; info: string }[]>([]);

  private graficoChart: Chart | null = null;
  private userId: number | null = null;

  private router = inject(Router);
  private professorService = inject(ProfessorService);
  private moduloService = inject(ModuloService);
  private atividadeService = inject(AtividadeService);
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
    const total = valores.reduce((soma, v) => soma + v, 0);

    if (this.graficoChart) {
      this.graficoChart.destroy();
      this.graficoChart = null;
    }

    Chart.register(...registerables);

    const percentPlugin = {
      id: 'percentLabels',
      afterDatasetsDraw: (chart: Chart) => {
        const { ctx } = chart;
        chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
          const valor = valores[index];
          const percent = total > 0 ? Math.round((valor / total) * 100) : 0;
          ctx.save();
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillStyle = '#0f2744';
          ctx.textAlign = 'center';
          ctx.fillText(`${percent}% (${valor})`, bar.x, bar.y - 8);
          ctx.restore();
        });
      },
    };

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
          padding: { top: 25 },
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
      plugins: [percentPlugin],
    });
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
}
