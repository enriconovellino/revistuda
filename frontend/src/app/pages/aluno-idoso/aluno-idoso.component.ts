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
  showBackButton = signal<boolean>(false);

  private router = inject(Router);
  private routerSub?: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const user = this.authService.getUser();
      if (user) this.userName.set(user.nome);

      // aplica a escala inicial de fonte (sem mexer no font-size base do html)
      this.aplicarFontSizeNoRoot(this.fontSize());
    }

    this.checkRoute(this.router.url);

    this.routerSub = this.router.events.subscribe(e => {
      this.checkRoute(this.router.url);

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

    // remove a variável de escala ao sair da área do aluno-idoso,
    // pra não afetar o resto do sistema (professor, admin, etc.)
    if (typeof window !== 'undefined') {
      document.documentElement.style.removeProperty('--app-font-scale');
    }
  }


  checkRoute(url: string) {
    this.showBackButton.set(url.includes('/modulo'));
  }

  voltar() {
    this.router.navigate(['/aluno-idoso'], { queryParams: { view: 'modulos' } });
  }

  changeFontSize(offset: number) {
    const next = parseFloat((this.fontSize() + offset).toFixed(1));
    if (next >= 0.9 && next <= 2.0) {
      this.fontSize.set(next);
      this.aplicarFontSizeNoRoot(next);
    }
  }

  private aplicarFontSizeNoRoot(size: number): void {
    if (typeof window !== 'undefined') {
      // variável CSS dedicada só pra escala de TEXTO, não afeta layout/rem geral
      document.documentElement.style.setProperty('--app-font-scale', `${size}`);
    }
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