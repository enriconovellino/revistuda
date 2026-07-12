import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarProfessorComponent } from './sidebar/sidebar.component';
import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';
import { Usuario } from '../../model/professor.models';

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarProfessorComponent, EditarPerfilComponent],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.scss',
})
export class ProfessorComponent implements OnInit {
  userName = signal<string>('Professor');
  isEditProfileOpen = signal<boolean>(false);

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
}