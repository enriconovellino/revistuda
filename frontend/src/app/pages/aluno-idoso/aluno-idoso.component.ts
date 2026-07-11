import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlunoService } from '../../services/aluno.service';
import { ModuloService } from '../../services/modulo.service';
import { LicaoService } from '../../services/licao.service';
import { AtividadeService } from '../../services/atividade.service';
import { Modulo } from '../../model/modulo.model';
import { Licao } from '../../model/licao.model';
import { Atividade } from '../../model/atividade.model';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

import { EditarPerfilComponent } from '../../components/editar-perfil/editar-perfil.component';

type DashboardView = 'home' | 'modulos' | 'atividades';

@Component({
  selector: 'app-aluno-idoso',
  standalone: true,
  imports: [CommonModule, FormsModule, EditarPerfilComponent],
  templateUrl: './aluno-idoso.component.html',
  styleUrl: './aluno-idoso.component.scss'
})
export class AlunoIdosoComponent implements OnInit {
  userName = signal('Aluno');
  isEditProfileOpen = signal<boolean>(false);
  fontSize = signal(1.2);
  currentView = signal<DashboardView>('home');
  searchQuery = signal<string>('');

  modulos = signal<Modulo[]>([]);
  licoes = signal<Licao[]>([]);
  atividades = signal<Atividade[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  moduloAtual = computed(() => this.modulos()[0] ?? null);

  filteredModulos = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.modulos();
    return this.modulos().filter(m => 
      m.titulo_modulo.toLowerCase().includes(query) || 
      (m.descricao_modulo && m.descricao_modulo.toLowerCase().includes(query))
    );
  });

  filteredAtividades = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.atividades();
    return this.atividades().filter(a => 
      a.titulo_atividade.toLowerCase().includes(query) || 
      (a.descricao_atividade && a.descricao_atividade.toLowerCase().includes(query))
    );
  });

  licoesDoModuloAtual = computed(() => {
    const mod = this.moduloAtual();
    if (!mod) return [];
    return this.licoes().filter(l => l.modulo_id === mod.modulo_id);
  });

  greetingTime = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  constructor(
    private authService: AuthService,
    private alunoService: AlunoService,
    private moduloService: ModuloService,
    private licaoService: LicaoService,
    private atividadeService: AtividadeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (typeof window !== 'undefined') {
      const user = this.authService.getUser();
      if (user) this.userName.set(user.nome);

      this.route.queryParamMap.subscribe(params => {
        const view = params.get('view');
        if (view === 'atividades' || view === 'modulos' || view === 'home') {
          this.currentView.set(view);
        }
      });

      await this.loadData();
    }
  }

  async loadData() {
    this.isLoading.set(true);
    this.hasError.set(false);
    try {
      const [modulos, licoes, atividades] = await Promise.all([
        this.moduloService.getModulos(),
        this.licaoService.getLicoes(),
        this.atividadeService.getAtividades()
      ]);
      this.modulos.set(modulos);
      this.licoes.set(licoes);
      this.atividades.set(atividades);
    } catch {
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  setView(view: DashboardView) {
    this.currentView.set(view);
  }

  acessarModulo(moduloId: number) {
    this.router.navigate(['/aluno-idoso/modulo', moduloId]);
  }

  fazerAtividade(atividadeId: number) {
    this.router.navigate(['/aluno-idoso/atividade', atividadeId]);
  }

  changeFontSize(offset: number) {
    const next = parseFloat((this.fontSize() + offset).toFixed(1));
    if (next >= 0.9 && next <= 2.0) this.fontSize.set(next);
  }

  getDificuldadeLabel(dificuldade: string): string {
    const map: Record<string, string> = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' };
    return map[dificuldade?.toUpperCase()] ?? dificuldade;
  }

  getTipoAtividadeLabel(tipo: string): string {
    const map: Record<string, string> = { 
      'multipla_escolha': 'Múltipla Escolha', 
      'associacao_imagens': 'Associação de Imagens' 
    };
    return map[tipo] ?? tipo;
  }

  getDificuldadeClass(dificuldade: string): string {
    const map: Record<string, string> = { FACIL: 'badge-facil', MEDIO: 'badge-medio', DIFICIL: 'badge-dificil' };
    return map[dificuldade?.toUpperCase()] ?? 'badge-facil';
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  abrirEditarPerfil() {
    this.isEditProfileOpen.set(true);
  }

  fecharEditarPerfil() {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: any) {
    this.userName.set(updatedUser.nome);
  }

  logout() {
    this.authService.logout();
  }
}
