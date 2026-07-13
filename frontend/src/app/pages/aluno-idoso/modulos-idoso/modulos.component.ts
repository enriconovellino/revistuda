import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlunoService } from '../../../services/aluno.service';
import { Modulo, Licao } from '../../../model/aluno.model';
import { environment } from '../../../../environments/environment';

interface ModuloComProgresso extends Modulo {
  totalLicoes: number;
  licoesConcluidas: number;
  percentual: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido';
}

@Component({
  selector: 'app-modulos-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modulos.component.html',
  styleUrl: './modulos.component.scss'
})
export class ModulosIdosoComponent implements OnInit {

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  modulos = signal<ModuloComProgresso[]>([]);
  licoes = signal<Licao[]>([]);

  constructor(
    private alunoService: AlunoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const [modulosData, licoesData] = await Promise.all([
        this.alunoService.getModulos(),
        this.alunoService.getLicoes()
      ]);

      this.licoes.set(licoesData);

      const modulosComProgresso: ModuloComProgresso[] = modulosData.map(modulo => {
        const total = licoesData.filter(l => l.modulo_id === modulo.modulo_id).length;
        const concluidas = this.alunoService.getLicoesConcluidas(modulo.modulo_id).length;
        const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;

        let status: 'nao_iniciado' | 'em_andamento' | 'concluido' = 'nao_iniciado';
        if (concluidas > 0 && concluidas < total) status = 'em_andamento';
        if (total > 0 && concluidas === total) status = 'concluido';

        return {
          ...modulo,
          totalLicoes: total,
          licoesConcluidas: concluidas,
          percentual,
          status
        };
      });

      this.modulos.set(modulosComProgresso);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar módulos:', message);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  textoBotao(modulo: ModuloComProgresso): string {
    switch (modulo.status) {
      case 'em_andamento': return 'CONTINUAR';
      case 'concluido': return 'REVISAR';
      default: return 'INICIAR';
    }
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  acessarModulo(moduloId: number): void {
    this.router.navigate(['/aluno-idoso/modulo', moduloId]);
  }
}