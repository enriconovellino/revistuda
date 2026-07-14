import { Component, inject, output, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar-idoso',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarIdosoComponent implements OnInit {
  private authService = inject(AuthService);

  abrirPerfil = output<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();

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

  logout(): void {
    this.authService.logout();
  }

  onAbrirPerfilClick(): void {
    this.abrirPerfil.emit();
  }
}
