import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';

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
  modulos = signal<Modulo[]>([]);
  licoes = signal<Licao[]>([]);

  constructor(
    private moduloService: ModuloService,
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
      const [modulos, licoes] = await Promise.all([
        this.moduloService.getModulos(),
        this.licaoService.getLicoes()
      ]);
      this.modulos.set(modulos);
      this.licoes.set(licoes);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar módulos:', message);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  qtdLicoes(moduloId: number): number {
    return this.licoes().filter(l => l.modulo_id === moduloId).length;
  }

  acessarModulo(moduloId: number): void {
    this.router.navigate(['/aluno-idoso/modulo', moduloId]);
  }
}