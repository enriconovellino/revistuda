import { Routes } from '@angular/router';
import { TelaLoginComponent } from './pages/tela-login/tela-login.component';
import { AlunoCriancaComponent } from './pages/aluno-crianca/aluno-crianca.component';
import { AlunoIdosoComponent } from './pages/aluno-idoso/aluno-idoso.component';
import { ProfessorComponent } from './pages/professor/professor.component';
import { AdmComponent } from './pages/adm/adm.component';
import { TelaInicialComponent} from './pages/tela-inicial/tela-inicial.component';
import { authGuard, roleGuard } from './guards/auth.guard';
import { ModuloDetalheComponent } from './pages/professor/modulo-detalhe/modulo-detalhe.component';
import { LoginIdosoComponent } from './pages/login-idoso/login-idoso.component';
import { EsqueciSenhaComponent } from './pages/tela-senha/esqueci-senha.component';
import { RedefinirSenhaComponent } from './pages/redefinir-senha/redefinir-senha.component';

export const routes: Routes = [
  { path: '', component: TelaInicialComponent },
  { path: 'login', component: TelaLoginComponent },
  {path: 'login-idoso', component: LoginIdosoComponent},
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent },

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
    path: 'professor/modulo/:id',
    component: ModuloDetalheComponent,
    canActivate: [authGuard, roleGuard(['PROFESSOR'])]
  },
  {
    path: 'adm',
    component: AdmComponent,
    canActivate: [authGuard, roleGuard(['ADM'])]
  },
  { path: '**', redirectTo: 'login' }
];
