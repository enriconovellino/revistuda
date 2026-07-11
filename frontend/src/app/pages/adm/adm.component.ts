import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';

import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { UsuariosAdminComponent } from './usuarios-admin/usuarios-admin.component';
import { TurmasAdminComponent } from './turmas-admin/turmas-admin.component';
import { RelatoriosAdminComponent } from './relatorios-admin/relatorios-admin.component';

export type AdmView = 'dashboard' | 'usuarios' | 'turmas' | 'relatorios';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [
    CommonModule,
    EditarPerfilComponent,
    DashboardAdminComponent,
    UsuariosAdminComponent,
    TurmasAdminComponent,
    RelatoriosAdminComponent,
  ],
  templateUrl: './adm.component.html',
  styleUrl: './adm.component.scss'
})
export class AdmComponent implements OnInit {
  userName = signal('Administrador');
  isEditProfileOpen = signal<boolean>(false);
  currentView = signal<AdmView>('dashboard');

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
    this.currentView.set(view);
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

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
