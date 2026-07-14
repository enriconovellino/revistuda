import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidebar-professor',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ConfirmDialogComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarProfessorComponent {
  private router = inject(Router);

  isLogoutModalOpen = signal<boolean>(false);

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

  abrirModalLogout() {
    this.isLogoutModalOpen.set(true);
  }

  cancelarLogout() {
    this.isLogoutModalOpen.set(false);
  }

  logout() {
    this.isLogoutModalOpen.set(false);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
