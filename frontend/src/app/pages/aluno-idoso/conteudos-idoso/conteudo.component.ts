import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlunoService } from '../../../services/aluno.service';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { Conteudo } from '../../../model/conteudo.model';
import { EditarPerfilComponent } from '../../../components/editar-perfil/editar-perfil.component';

@Component({
  selector: 'app-aluno-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conteudo.component.html',
  styleUrl: './conteudo.component.css',
})
export class AlunoModuloDetalheComponent implements OnInit {
  moduloId = 0;
  modulo = signal<Modulo | null>(null);
  licoes = signal<Licao[]>([]);
  conteudosForLicao = signal<{ [key: number]: Conteudo[] }>({});
  licoesConcluidas = signal<number[]>([]);

  comentarios = signal<{ [conteudoId: number]: string }>({});
  comentarioSalvo = signal<{ [conteudoId: number]: string }>({});
  comentarioSalvoId = signal<number | null>(null);
  editandoComentario = signal<{ [conteudoId: number]: boolean }>({});

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);
  private moduloService = inject(ModuloService);
  private licaoService = inject(LicaoService);
  private conteudoService = inject(ConteudoService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.moduloId = Number(id);
        this.loadData();
      }
    });
  }

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const mod = await this.moduloService.getModuloById(this.moduloId);
      this.modulo.set(mod);

      const allLicoes = await this.licaoService.getLicoes();
      const filteredLicoes = allLicoes.filter((l: Licao) => l.modulo_id === this.moduloId);
      this.licoes.set(filteredLicoes);

      const allConteudos = await this.conteudoService.getConteudos();
      const mappedConteudos: { [key: number]: Conteudo[] } = {};
      allConteudos.forEach((c: Conteudo) => {
        if (!mappedConteudos[c.licao_id]) {
          mappedConteudos[c.licao_id] = [];
        }
        if (c.url_conteudo) {
          c.safeUrl = this.getSafeYouTubeUrl(c.url_conteudo);
        }
        mappedConteudos[c.licao_id].push(c);
      });
      this.conteudosForLicao.set(mappedConteudos);

      const conteudoIds = allConteudos.map((c: Conteudo) => c.conteudo_id);
      const comentariosCarregados = await this.alunoService.getComentariosDoAluno(conteudoIds);

      this.comentarios.set(comentariosCarregados);
      this.comentarioSalvo.set(comentariosCarregados);

      this.licoesConcluidas.set(this.alunoService.getLicoesConcluidas(this.moduloId));

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar os dados do módulo.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  getSafeYouTubeUrl(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${match[2]}`);
    }
    return null;
  }

  isConcluida(licaoId: number): boolean {
    return this.licoesConcluidas().includes(licaoId);
  }

  toggleConcluida(licaoId: number): void {
    const atualizadas = this.alunoService.toggleLicaoConcluida(this.moduloId, licaoId);
    this.licoesConcluidas.set(atualizadas);
  }

  get totalConcluidas(): number {
    return this.licoesConcluidas().length;
  }

  getComentario(conteudoId: number): string {
    return this.comentarios()[conteudoId] || '';
  }

  onComentarioChange(conteudoId: number, texto: string): void {
    this.comentarios.update(atual => ({ ...atual, [conteudoId]: texto }));
  }

  estaEditandoComentario(conteudoId: number): boolean {
    const jaSalvou = !!this.comentarioSalvo()[conteudoId];
    const editando = this.editandoComentario()[conteudoId];
    return !jaSalvou || !!editando;
  }

  abrirEdicaoComentario(conteudoId: number): void {
    this.editandoComentario.update(atual => ({ ...atual, [conteudoId]: true }));
  }

  async salvarComentario(conteudoId: number): Promise<void> {
    const texto = this.getComentario(conteudoId);

    try {
      await this.alunoService.saveComentario(conteudoId, texto);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao salvar comentário:', message);
      return;
    }

    this.comentarioSalvo.update(atual => ({ ...atual, [conteudoId]: texto }));
    this.editandoComentario.update(atual => ({ ...atual, [conteudoId]: false }));
    this.comentarioSalvoId.set(conteudoId);

    setTimeout(() => {
      if (this.comentarioSalvoId() === conteudoId) {
        this.comentarioSalvoId.set(null);
      }
    }, 2000);
  }

  voltar(): void {
    this.router.navigate(['/aluno-idoso/modulos']);
  }
}