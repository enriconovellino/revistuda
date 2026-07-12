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

  anterior() {
    if (this.paginaAtual > 1) {
      this.paginaMudou.emit(this.paginaAtual - 1);
    }
  }

  proxima() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaMudou.emit(this.paginaAtual + 1);
    }
  }
}
