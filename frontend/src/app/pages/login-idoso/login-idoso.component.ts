import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-idoso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-idoso.component.html',
  styleUrl: './login-idoso.component.scss'
})
export class LoginIdosoComponent {
  isLogin = signal(true);

  email = '';
  senha = '';
  mostrarSenha = false;

  nome = '';
  emailCadastro = '';
  senhaCadastro = '';
  mostrarSenhaCadastro = false;

  emailTocado = false;
  senhaTocada = false;
  nomeTocado = false;
  emailCadastroTocado = false;
  senhaCadastroTocada = false;


  carregando = signal<boolean>(false);
  erro = signal<string | null>(null);
  tamanhoFonte = 100;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  setModo(login: boolean) {
    this.isLogin.set(login);
    this.erro.set(null);
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleSenhaCadastro() {
    this.mostrarSenhaCadastro = !this.mostrarSenhaCadastro;
  }

  marcarTocado(campo: string) {
    if (campo === 'email') this.emailTocado = true;
    if (campo === 'senha') this.senhaTocada = true;
    if (campo === 'nome') this.nomeTocado = true;
    if (campo === 'emailCadastro') this.emailCadastroTocado = true;
    if (campo === 'senhaCadastro') this.senhaCadastroTocada = true;
  }

  async login() {
  console.log('cliquei, email:', this.email, 'senha:', this.senha);
  this.erro.set(null);

    if (!this.email.trim() && !this.senha.trim()) {
      this.erro.set('Preencha o e-mail e a senha para continuar.');
      return;
    }
    if (!this.email.trim()) {
      this.erro.set('Por favor, preencha o campo de e-mail.');
      return;
    }
    if (!this.senha.trim()) {
      this.erro.set('Por favor, preencha o campo de senha.');
      return;
    }

    try {
      this.carregando.set(true);
      await this.authService.login({ email: this.email, senha: this.senha });
      this.router.navigate(['/aluno-idoso']);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'E-mail ou senha incorretos.';
      this.erro.set(message);
    } finally {
      this.carregando.set(false);
    }
  }


  async cadastrar() {
    this.erro.set(null);

    if (!this.nome.trim()) {
      this.erro.set('Por favor, preencha seu nome completo.');
      return;
    }
    if (!this.emailCadastro.trim()) {
      this.erro.set('Por favor, preencha o campo de e-mail.');
      return;
    }
    if (!this.senhaCadastro.trim()) {
      this.erro.set('Por favor, crie uma senha.');
      return;
    }
    if (this.senhaCadastro.trim().length < 6) {
      this.erro.set('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    try {
      this.carregando.set(true);
      await this.authService.register({
        nome: this.nome,
        email: this.emailCadastro,
        senha: this.senhaCadastro,
        permission: 'ALUNO_IDOSO'
      });
      this.setModo(true);
      this.email = this.emailCadastro;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível cadastrar.';
      this.erro.set(message);
    } finally {
      this.carregando.set(false);
    }
  }

  aumentarFonte(): void {
    if (this.tamanhoFonte < 150) {
      this.tamanhoFonte += 10;
      this.aplicarFonte();
    }
  }

  diminuirFonte(): void {
    if (this.tamanhoFonte > 80) {
      this.tamanhoFonte -= 10;
      this.aplicarFonte();
    }
  }

  private aplicarFonte(): void {
    document.documentElement.style.setProperty('--fonte-idoso', `${this.tamanhoFonte}%`);
  }

  loginPorVoz(): void {
    alert('Login por voz em desenvolvimento.');
  }
}