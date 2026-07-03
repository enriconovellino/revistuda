import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLogin = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);
  showSuccessModal = signal(false);
  mostrarSenhaLogin = false;
  mostrarSenhaCadastro = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  registerForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    permission: ['ALUNO_CRIANCA', [Validators.required]]
  });

  setMode(loginMode: boolean) {
    this.isLogin.set(loginMode);
    this.error.set(null);
    this.loginForm.reset();
    this.registerForm.reset({ permission: 'ALUNO_CRIANCA' });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.authService.login(this.loginForm.value);
      this.authService.redirectUserBasedOnRole(data.user);
    } catch (err: any) {
      this.error.set(err.message || 'Erro de conexão com o servidor');
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.register(this.registerForm.value);
      this.showSuccessModal.set(true);
      setTimeout(() => {
        this.showSuccessModal.set(false);
        const registeredEmail = this.registerForm.value.email;
        this.setMode(true);
        this.loginForm.patchValue({ email: registeredEmail });
      }, 2500);
    } catch (err: any) {
      this.error.set(err.message || 'Erro de conexão com o servidor');
    } finally {
      this.loading.set(false);
    }
  }
}
