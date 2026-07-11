import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { Modulo, Licao } from '../../../model/professor.models';
import { EditarPerfilComponent } from '../../../components/editar-perfil/editar-perfil.component';
import { NovaLicaoComponent } from '../nova-licao/nova.licao.component';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, EditarPerfilComponent, NovaLicaoComponent],
  templateUrl: './modulo-detalhe.component.html',
  styleUrl: './modulo-detalhe.component.css',
})
export class ModuloDetalheComponent implements OnInit {
  userName = signal<string>('Professor');
  moduloId = 0;
  modulo = signal<Modulo | null>(null);
  licoes = signal<Licao[]>([]);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  actionError = signal<string | null>(null);
  saving = signal<boolean>(false);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private professorService = inject(ProfessorService);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.userName.set(user.nome);
        }
      }

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.moduloId = Number(id);
          this.loadData();
        }
      });
    }
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const mod = await this.professorService.getModuloById(this.moduloId);
      this.modulo.set(mod);

      const allLicoes = await this.professorService.getLicoes();
      const filteredLicoes = allLicoes.filter(l => l.modulo_id === this.moduloId);
      this.licoes.set(filteredLicoes);

    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao carregar os dados do módulo.'));
    } finally {
      this.loading.set(false);
    }
  }

  voltar() {
    const tId = this.modulo()?.turma_id;
    if (tId) {
      this.router.navigate(['/professor'], { queryParams: { tab: 'modulos', turmaId: tId } });
    } else {
      this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
    }
  }

  verComentariosGerais() {
    this.router.navigate(['/professor/comentarios']);
  }

  irParaDashboard() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'dashboard' } });
  }

  irParaTurmas() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
  }

  irParaAlunos() {
    this.router.navigate(['/professor/alunos']);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }

  isEditProfileOpen = signal<boolean>(false);

  abrirEditarPerfil() {
    this.isEditProfileOpen.set(true);
  }

  fecharEditarPerfil() {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: any) {
    this.userName.set(updatedUser.nome);
  }
}