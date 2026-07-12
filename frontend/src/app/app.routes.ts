import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { AlunoIdosoComponent } from './pages/aluno-idoso/aluno-idoso.component';
import { ProfessorComponent } from './pages/professor/professor.component';
import { AdmComponent } from './pages/adm/adm.component';
import { TelaInicialComponent } from './pages/landing/tela-inicial/tela-inicial.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { ModuloDetalheComponent } from './pages/professor/modulo-detalhe/modulo-detalhe.component';
import { ComentariosAlunosComponent } from './pages/professor/comentarios/comentarios.component';
import { AlunosProfessorComponent } from './pages/professor/alunos/alunos.component';
import { LoginIdosoComponent } from './pages/auth/login-idoso/login-idoso.component';
import { EsqueciSenhaComponent } from './pages/auth/esqueci-senha/esqueci-senha.component';
import { RedefinirSenhaComponent } from './pages/auth/redefinir-senha/redefinir-senha.component';
import { AlunoModuloDetalheComponent } from './pages/aluno-idoso/tela-conteudo/modulo-detalhe.component';
import { TelaAtividade } from './pages/aluno-idoso/tela-atividade/tela-atividade';
import { ProfessorDashboardComponent } from './pages/professor/dashboard/dashboard.component';
import { TurmasProfessorComponent } from './pages/professor/turmas/turmas';
import { ModulosProfessorComponent } from './pages/professor/modulos/modulos.component';

export const routes: Routes = [
  { path: '', component: TelaInicialComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-idoso', component: LoginIdosoComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent },


  {
    path: 'aluno-idoso',
    component: AlunoIdosoComponent,
    canActivate: [authGuard, roleGuard(['ALUNO_IDOSO'])]
  },
  {
    path: 'aluno-idoso/modulo/:id',
    component: AlunoModuloDetalheComponent,
    canActivate: [authGuard, roleGuard(['ALUNO_IDOSO'])]
  },
  {
    path: 'aluno-idoso/atividade/:id',
    component: TelaAtividade,
    canActivate: [authGuard, roleGuard(['ALUNO_IDOSO'])]
  },
  {
    path: 'professor',
    component: ProfessorComponent,
    canActivate: [authGuard, roleGuard(['PROFESSOR'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ProfessorDashboardComponent },
      { path: 'turmas', component: TurmasProfessorComponent },
      { path: 'modulos', component: ModulosProfessorComponent },
      { path: 'modulo/:id', component: ModuloDetalheComponent },
      { path: 'comentarios', component: ComentariosAlunosComponent },
      { path: 'alunos', component: AlunosProfessorComponent }
    ]
  },
  {
    path: 'adm',
    component: AdmComponent,
    canActivate: [authGuard, roleGuard(['ADM'])]
  },
  { path: '**', redirectTo: 'login' }
];