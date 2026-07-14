import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/auth.model';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';
import { SidebarIdosoComponent } from './sidebar/sidebar.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-aluno-idoso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, EditarPerfilComponent, SidebarIdosoComponent, ConfirmDialogComponent],
  templateUrl: './aluno-idoso.component.html',
  styleUrl: './aluno-idoso.component.scss'
})
export class AlunoIdosoComponent implements OnInit {
  userName = signal<string>('Aluno');
  isEditProfileOpen = signal<boolean>(false);
  isLogoutModalOpen = signal<boolean>(false);
  fontSize = signal<number>(1.2);
  showBackButton = signal<boolean>(false);

  private router = inject(Router);

  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const user = this.authService.getUser();
      if (user) this.userName.set(user.nome);
    }

    this.checkRoute(this.router.url);
    this.router.events.subscribe(() => {
      this.checkRoute(this.router.url);
    });
  }

  checkRoute(url: string) {
    this.showBackButton.set(url.includes('/modulo'));
  }

  voltar() {
    this.router.navigate(['/aluno-idoso'], { queryParams: { view: 'modulos' } });
  }

  changeFontSize(offset: number) {
    const next = parseFloat((this.fontSize() + offset).toFixed(1));
    if (next >= 0.9 && next <= 2.0) this.fontSize.set(next);
  }

  abrirEditarPerfil(): void {
    this.isEditProfileOpen.set(true);
  }

  fecharEditarPerfil(): void {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: User): void {
    this.userName.set(updatedUser.nome);
  }

  abrirModalLogout(): void {
    this.isLogoutModalOpen.set(true);
  }

  cancelarLogout(): void {
    this.isLogoutModalOpen.set(false);
  }

  logout(): void {
    this.isLogoutModalOpen.set(false);
    this.authService.logout();
  }
}