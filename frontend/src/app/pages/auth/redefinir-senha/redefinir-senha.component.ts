import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.css',
})
export class RedefinirSenhaComponent implements OnInit {
  token = '';
  novaSenha = '';
  confirmarSenha = '';

  loading = signal(false);
  sucesso = signal(false);
  error = signal<string | null>(null);
  tokenAusente = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const t = params.get('token');
      if (!t) {
        this.tokenAusente.set(true);
      } else {
        this.token = t;
      }
    });
  }

  async redefinir() {
    this.error.set(null);

    if (!this.novaSenha || this.novaSenha.length < 6) {
      this.error.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.error.set('As senhas não coincidem.');
      return;
    }

    try {
      this.loading.set(true);
      await this.authService.resetPassword(this.token, this.novaSenha);
      this.sucesso.set(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao redefinir senha. O link pode ter expirado.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  solicitarNovoLink() {
    this.router.navigate(['/esqueci-senha']);
  }
}