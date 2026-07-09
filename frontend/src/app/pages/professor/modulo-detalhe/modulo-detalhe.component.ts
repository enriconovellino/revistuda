import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { Modulo, Licao, Conteudo, Atividade } from '../../../model/professor.models';
import { LicaoCardComponent } from '../components/licao-card/licao-card.component';
import { NovaLicaoComponent } from '../components/nova-licao/nova-licao.component';

@Component({
  selector: 'app-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, LicaoCardComponent, NovaLicaoComponent],
  templateUrl: './modulo-detalhe.component.html',
  styleUrl: './modulo-detalhe.component.css',
})
export class ModuloDetalheComponent implements OnInit {
  userName = signal<string>('Professor');
  moduloId = 0;
  modulo = signal<Modulo | null>(null);
  licoes = signal<Licao[]>([]);
  conteudosForLicao = signal<{ [key: number]: Conteudo[] }>({});
  atividadesForLicao = signal<{ [key: number]: Atividade[] }>({});

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private professorService = inject(ProfessorService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
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

  async loadData() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const mod = await this.professorService.getModuloById(this.moduloId);
      this.modulo.set(mod);

      const allLicoes = await this.professorService.getLicoes();
      const filteredLicoes = allLicoes.filter(l => l.modulo_id === this.moduloId);
      this.licoes.set(filteredLicoes);

      const allConteudos = await this.professorService.getConteudos();
      const mappedConteudos: { [key: number]: Conteudo[] } = {};
      allConteudos.forEach(c => {
        if (!mappedConteudos[c.licao_id]) {
          mappedConteudos[c.licao_id] = [];
        }
        mappedConteudos[c.licao_id].push(c);
      });
      this.conteudosForLicao.set(mappedConteudos);

      const allAtividades = await this.professorService.getAtividades();
      const mappedAtividades: { [key: number]: Atividade[] } = {};
      allAtividades.forEach(a => {
        if (!mappedAtividades[a.licao_id]) {
          mappedAtividades[a.licao_id] = [];
        }
        mappedAtividades[a.licao_id].push(a);
      });
      this.atividadesForLicao.set(mappedAtividades);

    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar os dados do módulo.');
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

  irParaDashboard() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'dashboard' } });
  }

  irParaTurmas() {
    this.router.navigate(['/professor'], { queryParams: { tab: 'turmas' } });
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/auth']);
  }
}
