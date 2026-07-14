import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TutorialService } from '../../../services/tutorial.service';

type Perfil = 'idoso' | 'professor' | 'adm';

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tela-inicial.component.html',
  styleUrl: './tela-inicial.component.scss'
})
export class TelaInicialComponent {
  private router = inject(Router);
  public tutorialService = inject(TutorialService);

  iniciarTutorial(): void {
    this.tutorialService.startTutorial();
  }

  cancelarTutorial(): void {
    this.tutorialService.cancelTutorial();
  }

  escolherPerfil(perfil: Perfil): void {
    if (perfil === 'idoso') {
      if (this.tutorialService.active() && this.tutorialService.step() === 'step1') {
        this.tutorialService.nextStep();
      }
      this.router.navigate(['/login-idoso']);
    } else {
      const permissionMap: Record<string, string> = {
        professor: 'PROFESSOR',
        adm: 'ADM'
      };
      this.router.navigate(['/login'], {
        queryParams: { permission: permissionMap[perfil] }
      });
    }
  }
}