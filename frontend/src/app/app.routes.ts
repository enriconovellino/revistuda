import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { AlunoCriancaComponent } from './pages/aluno-crianca/aluno-crianca.component';
import { AlunoIdosoComponent } from './pages/aluno-idoso/aluno-idoso.component';
import { ProfessorComponent } from './pages/professor/professor.component';
import { AdmComponent } from './pages/adm/adm.component';
import { AdmOverviewComponent } from './pages/adm/pages/overview/adm-overview.component';
import { AdmUsersComponent } from './pages/adm/pages/users/adm-users.component';
import { AdmTurmasComponent } from './pages/adm/pages/turmas/adm-turmas.component';
import { AdmModulosComponent } from './pages/adm/pages/modulos/adm-modulos.component';
import { AdmConteudosComponent } from './pages/adm/pages/conteudos/adm-conteudos.component';
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
    canActivate: [authGuard, roleGuard(['ADM'])],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdmOverviewComponent },
      { path: 'users', component: AdmUsersComponent },
      { path: 'turmas', component: AdmTurmasComponent },
      { path: 'modulos', component: AdmModulosComponent },
      { path: 'conteudos', component: AdmConteudosComponent },
    ]
  },
  { path: '**', redirectTo: 'auth' }
];
