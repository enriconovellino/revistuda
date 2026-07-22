import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css',
})
export class PaginatorComponent {
  @Input() paginaAtual = 1;
  @Input() totalPaginas = 1;
  @Output() paginaMudou = new EventEmitter<number>();

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaMudou.emit(pagina);
    }
  }

  anterior() {
    this.mudarPagina(this.paginaAtual - 1);
  }

  proxima() {
    this.mudarPagina(this.paginaAtual + 1);
  }
}
