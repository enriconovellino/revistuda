import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.css',
})
export class EsqueciSenhaComponent {
  email = '';
  loading = signal(false);
  enviado = signal(false);
  error = signal<string | null>(null);

  private authService = inject(AuthService);
  private router = inject(Router);

  async enviar() {
    this.error.set(null);

    if (!this.email.trim()) {
      this.error.set('Digite seu e-mail.');
      return;
    }

    try {
      this.loading.set(true);
      await this.authService.forgotPassword(this.email.trim());
      this.enviado.set(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  voltarParaLogin() {
    this.router.navigate(['/login']);
  }
}
