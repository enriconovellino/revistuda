import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { AlunoCriancaComponent } from './pages/aluno-crianca/aluno-crianca.component';
import { AlunoIdosoComponent } from './pages/aluno-idoso/aluno-idoso.component';
import { ProfessorComponent } from './pages/professor/professor.component';
import { AdmComponent } from './pages/adm/adm.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { 
    path: 'aluno-crianca', 
    component: AlunoCriancaComponent,
    canActivate: [authGuard, roleGuard(['ALUNO_CRIANCA'])] 
  },
  { 
    path: 'aluno-idoso', 
    component: AlunoIdosoComponent,
    canActivate: [authGuard, roleGuard(['ALUNO_IDOSO'])]
  },
  { 
    path: 'professor', 
    component: ProfessorComponent,
    canActivate: [authGuard, roleGuard(['PROFESSOR'])]
  },
  { 
    path: 'adm', 
    component: AdmComponent,
    canActivate: [authGuard, roleGuard(['ADM'])]
  },
  { path: '**', redirectTo: 'auth' }
];
