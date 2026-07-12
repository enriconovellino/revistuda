import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatorioService } from '../../../services/relatorio.service';
import { RelatorioOverview } from '../../../model/relatorio.model';

@Component({
  selector: 'app-relatorios-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss'
})
export class RelatoriosAdminComponent implements OnInit {
  private relatorioService = inject(RelatorioService);

  loading = signal<boolean>(false);
  overview = signal<RelatorioOverview | null>(null);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const overview = await this.relatorioService.getOverview();
      this.overview.set(overview);
    } finally {
      this.loading.set(false);
    }
  }
}
