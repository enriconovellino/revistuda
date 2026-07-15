import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SidebarProfessorComponent } from './sidebar/sidebar.component';
import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Usuario } from '../../model/professor.models';

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarProfessorComponent, EditarPerfilComponent, ConfirmDialogComponent],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.scss',
})
export class ProfessorComponent implements OnInit, OnDestroy {
  userName = signal<string>('Professor');
  isEditProfileOpen = signal<boolean>(false);
  isLogoutModalOpen = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);

  private router = inject(Router);
  private routerSub?: Subscription;

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: Usuario = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }

    // Intercepta o botão "Voltar" SOMENTE quando a navegação sair de /professor
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationStart &&
                  (e as NavigationStart).navigationTrigger === 'popstate' &&
                  !(e as NavigationStart).url.startsWith('/professor'))
    ).subscribe(() => {
      this.router.navigate([this.router.url]);
      this.isLogoutModalOpen.set(true);
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  abrirEditarPerfil() {
    this.isEditProfileOpen.set(true);
  }

  fecharEditarPerfil() {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: Usuario) {
    this.userName.set(updatedUser.nome);
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