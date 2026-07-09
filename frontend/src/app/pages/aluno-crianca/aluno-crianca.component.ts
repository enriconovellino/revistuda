import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';

@Component({
  selector: 'app-aluno-crianca',
  standalone: true,
  imports: [CommonModule, EditarPerfilComponent],
  templateUrl: './aluno-crianca.component.html',
  styleUrl: './aluno-crianca.component.css'
})
export class AlunoCriancaComponent implements OnInit {
  userName = signal('Amiguinho(a)');
  isEditProfileOpen = signal<boolean>(false);

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
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

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
