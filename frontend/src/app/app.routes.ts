import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardAlunoIdosoComponent } from './pages/aluno-idoso/dashboard-idoso/dashboard.component';
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
import { AlunoModuloDetalheComponent } from './pages/aluno-idoso/conteudos-idoso/conteudo.component';
import { TelaAtividade } from './pages/aluno-idoso/tela-atividade/tela-atividade';
import { ProfessorDashboardComponent } from './pages/professor/dashboard/dashboard.component';
import { TurmasProfessorComponent } from './pages/professor/turmas/turmas';
import { ModulosProfessorComponent } from './pages/professor/modulos/modulos.component';

import { ModulosIdosoComponent } from './pages/aluno-idoso/modulos-idoso/modulos.component';
import { AtividadesIdosoComponent } from './pages/aluno-idoso/atividades-idoso/atividades.component';
import { ComentariosIdosoComponent } from './pages/aluno-idoso/comentario-idoso/comentarios.component';

export const routes: Routes = [
  { path: '', component: TelaInicialComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-idoso', component: LoginIdosoComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent },


 {
  path: 'aluno-idoso',
  component: AlunoIdosoComponent,
  canActivate: [authGuard, roleGuard(['ALUNO_IDOSO'])],
  children: [
    { path: '', component: DashboardAlunoIdosoComponent },
    { path: 'modulos', component: ModulosIdosoComponent },
    { path: 'atividades', component: AtividadesIdosoComponent },
    { path: 'comentarios', component: ComentariosIdosoComponent },
    { path: 'modulo/:id', component: AlunoModuloDetalheComponent },
    { path: 'atividade/:id', component: TelaAtividade },
  ]
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