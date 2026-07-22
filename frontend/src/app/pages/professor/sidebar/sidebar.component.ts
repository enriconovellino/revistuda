import { Component, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar-professor',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarProfessorComponent implements OnInit {
  @Output() collapsedChange = new EventEmitter<boolean>();

  private router = inject(Router);

  isLogoutModalOpen = signal<boolean>(false);
  collapsed = signal<boolean>(false);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.collapsed.set(localStorage.getItem('sidebarCollapsed') === 'true');
      this.collapsedChange.emit(this.collapsed());
    }
  }

  toggleCollapse() {
    this.collapsed.set(!this.collapsed());
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('sidebarCollapsed', String(this.collapsed()));
    }
    this.collapsedChange.emit(this.collapsed());
  }

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
