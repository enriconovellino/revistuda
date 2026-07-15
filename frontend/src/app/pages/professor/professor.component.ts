import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
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
export class ProfessorComponent implements OnInit {
  userName = signal<string>('Professor');
  isEditProfileOpen = signal<boolean>(false);
  isLogoutModalOpen = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);

  private router = inject(Router);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: Usuario = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
  }

  abrirEditarPerfil() {
    this.isEditProfileOpen.set(true);
  }

  fecharEditarPerfil() {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: any) {
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