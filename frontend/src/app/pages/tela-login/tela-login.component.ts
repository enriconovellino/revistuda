import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tela-login.component.html',
  styleUrl: './tela-login.component.scss'
})
export class TelaLoginComponent implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLogin = signal(true);
  loading = signal(false);
  error = signal<string |null>(null);
  showSuccessModal = signal(false);

  mostrarSenhaLogin = false;
  mostrarSenhaCadastro = false;
  perfilSelecionado: string = 'ALUNO_IDOSO';
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  registerForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    permission: ['ALUNO_IDOSO', Validators.required]
  });

  successMessage = signal('Cadastro realizado com sucesso!');

  ngOnInit(): void {

    const permission = this.route.snapshot.queryParamMap.get('permission');

    console.log('Permissão recebida:', permission);

    if (permission) {

      this.perfilSelecionado = permission;

      this.registerForm.patchValue({
        permission: permission
      });

    }

  }

  setMode(loginMode: boolean) {

    this.isLogin.set(loginMode);
    this.error.set(null);

    this.loginForm.reset();

    this.registerForm.reset({
      permission: this.perfilSelecionado

      
    });
  }
  irParaEsqueciSenha() {
  this.router.navigate(['/esqueci-senha']);
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

    console.log('Dados enviados:', this.registerForm.value);

    this.loading.set(true);
    this.error.set(null);

    try {

      const isProfessor =
        this.registerForm.value.permission === 'PROFESSOR';

      if (isProfessor) {
        this.successMessage.set(
          'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.'
        );
      } else {
        this.successMessage.set('Cadastro realizado com sucesso!');
      }

      await this.authService.register(this.registerForm.value);

      this.showSuccessModal.set(true);

      setTimeout(() => {

        this.showSuccessModal.set(false);

        const registeredEmail = this.registerForm.value.email;

        this.setMode(true);

        this.loginForm.patchValue({
          email: registeredEmail
        });

      }, 2500);

    } catch (err: any) {

      this.error.set(err.message || 'Erro de conexão com o servidor');

    } finally {

      this.loading.set(false);

    }

  }

}