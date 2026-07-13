import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AlunoService } from '../../../services/aluno.service';
import { Atividade, Licao } from '../../../model/aluno.model';

@Component({
  selector: 'app-atividades-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atividades.component.html',
  styleUrl: './atividades.component.scss'
})
export class AtividadesIdosoComponent implements OnInit {

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  atividades = signal<Atividade[]>([]);
  moduloId = signal<number | null>(null);

  constructor(
    private alunoService: AlunoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
      const [todasAtividades, todasLicoes] = await Promise.all([
        this.alunoService.getAtividades(),
        this.alunoService.getLicoes()
      ]);

      const moduloId = this.moduloId();

      if (moduloId !== null) {
        const licaoIdsDoModulo = new Set(
          todasLicoes.filter((l: Licao) => l.modulo_id === moduloId).map((l: Licao) => l.licao_id)
        );
        const filtradas = todasAtividades.filter(a => licaoIdsDoModulo.has(a.licao_id));
        this.atividades.set(filtradas);

        // Se só tiver uma atividade nesse módulo, abre ela direto
        if (filtradas.length === 1) {
          this.fazerAtividade(filtradas[0].atividade_id);
          return;
        }
      } else {
        this.atividades.set(todasAtividades);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar atividades:', message);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
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