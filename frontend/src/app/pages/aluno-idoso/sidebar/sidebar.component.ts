import { Component, inject, output } from '@angular/core';
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
export class SidebarIdosoComponent {
  private authService = inject(AuthService);

  abrirPerfil = output<void>();

  logout(): void {
    this.authService.logout();
  }

  onAbrirPerfilClick(): void {
    this.abrirPerfil.emit();
  }
}