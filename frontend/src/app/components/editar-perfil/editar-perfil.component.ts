import { Component, OnInit, signal, inject, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

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
  saveSuccess = output<any>();
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

  user: any = null;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
        this.nome.set(this.user.nome);
        this.email.set(this.user.email);
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

    try {
      this.loading.set(true);
      const updateData: any = {
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

    } catch (err: any) {
      this.error.set(err.message || 'Erro ao atualizar dados do perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async onDeleteAccount() {
    this.deleteError.set(null);

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

    } catch (err: any) {
      this.deleteError.set(err.message || 'Erro ao excluir a conta. Tente novamente.');
    } finally {
      this.deletando.set(false);
    }
  }

  onCancel() {
    this.close.emit();
  }
}