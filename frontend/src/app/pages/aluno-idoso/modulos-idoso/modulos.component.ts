import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { TutorialService } from '../../../services/tutorial.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { Conteudo } from '../../../model/conteudo.model';
import { environment } from '../../../../environments/environment';
import { labelDificuldade, nivelDificuldade } from '../../../model/dificuldade.util';

interface ModuloComProgresso extends Modulo {
  totalLicoes: number;
  licoesConcluidas: number;
  percentual: number;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido';
}

interface PreviewConteudo {
  tipo: 'video' | 'texto' | 'vazio';
  titulo?: string;
  thumbnailUrl?: string;
  embedUrl?: SafeResourceUrl;
  textoResumo?: string;
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

  nivelDificuldade = nivelDificuldade;
  labelDificuldade = labelDificuldade;

  proximoPassoTutorial() {
    this.tutorialService.avancarCursos();
  }

  iniciarTutorialCursos() {
    this.tutorialService.active.set(true);
    this.tutorialService.setStepAndSpeak('cursosLista');
  }

  private sanitizer = inject(DomSanitizer);

  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  modulos = signal<ModuloComProgresso[]>([]);
  licoes = signal<Licao[]>([]);

  // --- Preview no hover ---
  moduloEmPreview = signal<number | null>(null);
  previewCache = signal<Map<number, PreviewConteudo>>(new Map());
  carregandoPreview = signal<Set<number>>(new Set());
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private todosConteudos: Conteudo[] | null = null;

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

      const modulosComProgresso: ModuloComProgresso[] = await Promise.all(
        modulos.map(async modulo => {
          const licoeDoModulo = licoes.filter(l => l.modulo_id === modulo.modulo_id);
          const total = licoeDoModulo.length;

          let concluidas = 0;
          try {
            const conteudosConcluidos = await this.conteudoService.getProgressoConteudos(modulo.modulo_id);
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

  // ---------- Lógica do hover-preview ----------

  onMouseEnterModulo(moduloId: number): void {
    this.hoverTimeout = setTimeout(() => {
      this.moduloEmPreview.set(moduloId);
      this.carregarPreview(moduloId);
    }, 350);
  }

  onMouseLeaveModulo(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this.moduloEmPreview.set(null);
  }

  private async carregarPreview(moduloId: number): Promise<void> {
    if (this.previewCache().has(moduloId)) return;
    if (this.carregandoPreview().has(moduloId)) return;

    this.carregandoPreview.update(set => new Set(set).add(moduloId));

    try {
      const primeiraLicao = this.licoes()
        .filter(l => l.modulo_id === moduloId)
        .sort((a, b) => a.licao_id - b.licao_id)[0];

      if (!primeiraLicao) {
        this.salvarPreview(moduloId, { tipo: 'vazio' });
        return;
      }

      if (!this.todosConteudos) {
        this.todosConteudos = await this.conteudoService.getConteudos();
      }

      const conteudosDaLicao = this.todosConteudos
        .filter(c => c.licao_id === primeiraLicao.licao_id);
      const primeiroConteudo = conteudosDaLicao[0];

      if (!primeiroConteudo) {
        this.salvarPreview(moduloId, { tipo: 'vazio' });
        return;
      }

      // Aceita "Vídeo" (como salvo pelo formulário do professor) e "video" (sem acento/minúsculo)
      const tipo = (primeiroConteudo.tipo_conteudo ?? '').toLowerCase();
      const ehVideo = tipo === 'vídeo' || tipo === 'video';

      if (ehVideo && primeiroConteudo.url_conteudo) {
        const videoId = this.extrairIdYoutube(primeiroConteudo.url_conteudo);
        let embedUrl: SafeResourceUrl | undefined;

        if (videoId) {
          const params = new URLSearchParams({
            autoplay: '1',
            mute: '0',           // tentando com som — pode não funcionar (ver aviso acima)
            controls: '0',
            loop: '1',
            playlist: videoId,
            start: '0',
            end: '15',
            modestbranding: '1',
            rel: '0',
            disablekb: '1',
            fs: '0'
          });
          const rawUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
          embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
        }

        this.salvarPreview(moduloId, {
          tipo: 'video',
          titulo: primeiroConteudo.nome_conteudo,
          thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined,
          embedUrl
        });
      } else {
        this.salvarPreview(moduloId, {
          tipo: 'texto',
          titulo: primeiroConteudo.nome_conteudo,
          textoResumo: (primeiroConteudo.texto_conteudo ?? '').slice(0, 140)
        });
      }
    } catch {
      this.salvarPreview(moduloId, { tipo: 'vazio' });
    } finally {
      this.carregandoPreview.update(set => {
        const novo = new Set(set);
        novo.delete(moduloId);
        return novo;
      });
    }
  }

  private salvarPreview(moduloId: number, preview: PreviewConteudo): void {
    this.previewCache.update(map => {
      const novo = new Map(map);
      novo.set(moduloId, preview);
      return novo;
    });
  }

  previewDoModulo(moduloId: number): PreviewConteudo | undefined {
    return this.previewCache().get(moduloId);
  }

  private extrairIdYoutube(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    return match ? match[1] : null;
  }
}