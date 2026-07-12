import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-professor',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarProfessorComponent {
  private router = inject(Router);

  isDashboardActive(): boolean {
    const url = this.router.url;
    return url === '/professor/dashboard' || url === '/professor';
  }

  isTurmasActive(): boolean {
    const url = this.router.url;
    return url.includes('/professor/turmas') || url.includes('/professor/modulos') || url.includes('/professor/modulo/');
  }

  isAlunosActive(): boolean {
    return this.router.url.startsWith('/professor/alunos');
  }

  isComentariosActive(): boolean {
    return this.router.url.startsWith('/professor/comentarios');
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
