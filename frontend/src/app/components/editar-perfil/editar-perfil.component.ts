import { Component, OnInit, signal, inject, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UpdateUserData } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../model/professor.models';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent implements OnInit {
  isOpen = input<boolean>(false);
  close = output<void>();
  saveSuccess = output<Usuario>();
  accountDeleted = output<void>();

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  nome = signal<string>('');
  email = signal<string>('');
  senha = signal<string>('');
  confirmSenha = signal<string>('');
  senhaAtual = signal<string>('');

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  confirmandoExclusao = signal<boolean>(false);
  deletando = signal<boolean>(false);
  deleteError = signal<string | null>(null);

  user: Usuario | null = null;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr) as Usuario;
        this.user = parsedUser;
        this.nome.set(parsedUser.nome);
        this.email.set(parsedUser.email);
      }
    }
    this.senha.set('');
    this.confirmSenha.set('');
    this.senhaAtual.set('');
    this.error.set(null);
    this.success.set(false);
    this.confirmandoExclusao.set(false);
    this.deleteError.set(null);
  }

  ngOnChanges() {
    if (this.isOpen()) {
      this.loadUserData();
    }
  }
  

  async onSave() {
    this.error.set(null);
    this.success.set(false);

    if (!this.nome().trim()) {
      this.error.set('O nome é obrigatório.');
      return;
    }

    if (!this.email().trim()) {
      this.error.set('O e-mail é obrigatório.');
      return;
    }

    if (this.senha() && this.senha().length < 6) {
      this.error.set('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (this.senha() !== this.confirmSenha()) {
      this.error.set('As senhas não coincidem.');
      return;
    }

    if (this.senha() && !this.senhaAtual().trim()) {
      this.error.set('A senha atual é obrigatória para alterar a senha.');
      return;
    }

    if (!this.user) {
      this.error.set('Usuário não carregado. Feche e abra novamente o modal.');
      return;
    }

    try {
      this.loading.set(true);
      const updateData: UpdateUserData = {
        nome: this.nome().trim(),
        email: this.email().trim()
      };

      if (this.senha()) {
        updateData.senha = this.senha();
        updateData.senha_atual = this.senhaAtual();
      }


      const res = await this.userService.updateUser(this.user.id, updateData);

      if (typeof window !== 'undefined' && window.localStorage) {
        const updatedUser = { ...this.user, nome: res.nome, email: res.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.saveSuccess.emit(updatedUser);
      }

      this.success.set(true);

      setTimeout(() => {
        this.close.emit();
      }, 1200);

    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Erro ao atualizar dados do perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async onDeleteAccount() {
    this.deleteError.set(null);

    if (!this.user) {
      this.deleteError.set('Usuário não carregado. Feche e abra novamente o modal.');
      return;
    }

    try {
      this.deletando.set(true);
      await this.userService.deleteUser(this.user.id);

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }

      this.accountDeleted.emit();
      this.close.emit();
      this.router.navigate(['/login']);

    } catch (err) {
      this.deleteError.set(err instanceof Error ? err.message : 'Erro ao excluir a conta. Tente novamente.');
    } finally {
      this.deletando.set(false);
    }
  }

  onCancel() {
    this.close.emit();
  }
}