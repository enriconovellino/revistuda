import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

type Perfil = 'idoso' | 'crianca' | 'professor' | 'adm';

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [],
  templateUrl: './tela-inicial.component.html',
  styleUrl: './tela-inicial.component.scss'
})
export class TelaInicialComponent {
  private router = inject(Router);

  escolherPerfil(perfil: Perfil): void {
  if (perfil === 'idoso') {
    this.router.navigate(['/login-idoso']);
  } else {
    const permissionMap: Record<string, string> = {
      crianca: 'ALUNO_CRIANCA',
      professor: 'PROFESSOR',
      adm: 'ADM'
    };
    this.router.navigate(['/auth'], {
      queryParams: { permission: permissionMap[perfil] }
    });
  }
}
}