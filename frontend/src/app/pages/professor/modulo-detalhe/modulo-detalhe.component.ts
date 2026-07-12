import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { NovaLicaoComponent } from '../nova-licao/nova.licao.component';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, NovaLicaoComponent],
  templateUrl: './modulo-detalhe.component.html',
  styleUrl: './modulo-detalhe.component.css',
})
export class ModuloDetalheComponent implements OnInit {
  moduloId = 0;
  modulo = signal<Modulo | null>(null);
  licoes = signal<Licao[]>([]);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  actionError = signal<string | null>(null);
  saving = signal<boolean>(false);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private moduloService = inject(ModuloService);
  private licaoService = inject(LicaoService);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.moduloId = Number(id);
          this.loadData();
        }
      });
    }
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const mod = await this.moduloService.getModuloById(this.moduloId);
      this.modulo.set(mod);

      const allLicoes = await this.licaoService.getLicoes();
      const filteredLicoes = allLicoes.filter(l => l.modulo_id === this.moduloId);
      this.licoes.set(filteredLicoes);

    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao carregar os dados do módulo.'));
    } finally {
      this.loading.set(false);
    }
  }

  voltar() {
    const tId = this.modulo()?.turma_id;
    if (tId) {
      this.router.navigate(['/professor/modulos'], { queryParams: { turmaId: tId } });
    } else {
      this.router.navigate(['/professor/turmas']);
    }
  }
}