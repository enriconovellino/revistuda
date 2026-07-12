import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlunoService } from '../../../services/aluno.service';
import { Atividade } from '../../../model/aluno.model';

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
      const atividades = await this.alunoService.getAtividades();
      this.atividades.set(atividades);
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