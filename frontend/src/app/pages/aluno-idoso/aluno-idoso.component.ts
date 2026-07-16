import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../model/professor.models';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
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
export class AlunoIdosoComponent implements OnInit, OnDestroy {
  userName = signal<string>('Aluno');
  isEditProfileOpen = signal<boolean>(false);
  isLogoutModalOpen = signal<boolean>(false);
  fontSize = signal<number>(1.2);
  sidebarCollapsed = signal<boolean>(false);

  private router = inject(Router);
  private routerSub?: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const user = this.authService.getUser();
      if (user) this.userName.set(user.nome);
    }

    // Assina eventos de navegação para interceptar popstate para fora de /aluno-idoso
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationStart &&
          e.navigationTrigger === 'popstate' &&
          !e.url.startsWith('/aluno-idoso')) {
        this.router.navigate([this.router.url]);
        this.isLogoutModalOpen.set(true);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
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

  onProfileUpdated(updatedUser: Usuario): void {
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