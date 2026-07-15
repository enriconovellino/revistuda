import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { TutorialService } from '../../../services/tutorial.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { environment } from '../../../../environments/environment';

interface ModuloComProgresso extends Modulo {
  totalLicoes: number;
  licoesConcluidas: number;
  percentual: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido';
}

@Component({
  selector: 'app-modulos-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modulos.component.html',
  styleUrl: './modulos.component.scss'
})
export class ModulosIdosoComponent implements OnInit {
  public tutorialService = inject(TutorialService);

  proximoPassoTutorial() {
    this.tutorialService.avancarCursos();
  }

  iniciarTutorialCursos() {
    this.tutorialService.active.set(true);
    this.tutorialService.step.set('cursosLista');
  }

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  modulos = signal<ModuloComProgresso[]>([]);
  licoes = signal<Licao[]>([]);

  constructor(
    private moduloService: ModuloService,
    private licaoService: LicaoService,
    private conteudoService: ConteudoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const [modulos, licoes] = await Promise.all([
        this.moduloService.getModulos(),
        this.licaoService.getLicoes()
      ]);

      this.licoes.set(licoes);

      // Buscar progresso de conteúdos por módulo via API
      const modulosComProgresso: ModuloComProgresso[] = await Promise.all(
        modulos.map(async modulo => {
          const licoeDoModulo = licoes.filter(l => l.modulo_id === modulo.modulo_id);
          const total = licoeDoModulo.length;

          // Busca os conteúdos concluídos do banco para este módulo
          let concluidas = 0;
          try {
            const conteudosConcluidos = await this.conteudoService.getProgressoConteudos(modulo.modulo_id);
            // Uma lição é concluída quando todos os seus conteúdos estão marcados — aqui
            // usamos conteúdos concluídos como proxy; se o array não está vazio, conta
            if (conteudosConcluidos.length > 0) {
              concluidas = Math.min(conteudosConcluidos.length, total);
            }
          } catch { /* silencioso */ }

          const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;

          let status: 'nao_iniciado' | 'em_andamento' | 'concluido' = 'nao_iniciado';
          if (concluidas > 0 && concluidas < total) status = 'em_andamento';
          if (total > 0 && concluidas === total) status = 'concluido';

          return { ...modulo, totalLicoes: total, licoesConcluidas: concluidas, percentual, status };
        })
      );

      this.modulos.set(modulosComProgresso);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar módulos:', message);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  textoBotao(modulo: ModuloComProgresso): string {
    switch (modulo.status) {
      case 'em_andamento': return 'CONTINUAR';
      case 'concluido': return 'REVISAR';
      default: return 'INICIAR';
    }
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  onImagemErro(modulo: ModuloComProgresso): void {
    this.modulos.update(lista =>
      lista.map(m => m.modulo_id === modulo.modulo_id ? { ...m, imagem_url: undefined } : m)
    );
  }

  acessarModulo(moduloId: number): void {
    this.router.navigate(['/aluno-idoso/modulo', moduloId]);
  }
}