import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { DashboardAdminComponent } from './dashboard/dashboard.component';
import { UsuariosAdminComponent } from './usuarios/usuarios.component';
import { TurmasAdminComponent } from './turmas/turmas.component';
import { RelatoriosAdminComponent } from './relatorios/relatorios.component';
import { SidebarAdminComponent } from './sidebar/sidebar.component';

export type AdmView = 'dashboard' | 'usuarios' | 'turmas' | 'relatorios';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    EditarPerfilComponent,
    ConfirmDialogComponent,
    DashboardAdminComponent,
    UsuariosAdminComponent,
    TurmasAdminComponent,
    RelatoriosAdminComponent,
    SidebarAdminComponent,
  ],
  templateUrl: './adm.component.html',
  styleUrl: './adm.component.scss'
})
export class AdmComponent implements OnInit {
  userName = signal('Administrador');
  isEditProfileOpen = signal<boolean>(false);
  isLogoutModalOpen = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);

  private router = inject(Router);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.userName.set(user.nome);
        }
      }
    }
  }

  irPara(view: AdmView) {
    this.router.navigate(['/adm', view]);
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
