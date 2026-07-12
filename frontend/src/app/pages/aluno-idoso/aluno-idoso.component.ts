import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';


@Component({
  selector: 'app-aluno-idoso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, EditarPerfilComponent],
  templateUrl: './aluno-idoso.component.html',
  styleUrl: './aluno-idoso.component.scss'
})
export class AlunoIdosoComponent implements OnInit {
  userName = signal<string>('Aluno');
  isEditProfileOpen = signal<boolean>(false);
  fontSize = signal<number>(1.2);
  searchQuery = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = this.authService.getUser();
      if (user) this.userName.set(user.nome);
    }
  }

  changeFontSize(offset: number): void {
    const next = parseFloat((this.fontSize() + offset).toFixed(1));
    if (next >= 0.9 && next <= 2.0) this.fontSize.set(next);
  }

  getDificuldadeLabel(dificuldade: string): string {
    const map: Record<string, string> = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' };
    return map[dificuldade?.toUpperCase()] ?? dificuldade;
  }

  getDificuldadeClass(dificuldade: string): string {
    const map: Record<string, string> = { FACIL: 'badge-facil', MEDIO: 'badge-medio', DIFICIL: 'badge-dificil' };
    return map[dificuldade?.toUpperCase()] ?? 'badge-facil';
  }

  getTipoAtividadeLabel(tipo: string): string {
    const map: Record<string, string> = {
      'multipla_escolha': 'Múltipla Escolha',
      'associacao_imagens': 'Associação de Imagens'
    };
    return map[tipo] ?? tipo;
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
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

  logout(): void {
    this.authService.logout();
  }
}