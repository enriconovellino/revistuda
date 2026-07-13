import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlunoService } from '../../../services/aluno.service';
import { ModuloService } from '../../../services/modulo.service';
import { LicaoService } from '../../../services/licao.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { AtividadeService } from '../../../services/atividade.service';
import { Modulo } from '../../../model/modulo.model';
import { Licao } from '../../../model/licao.model';
import { Conteudo } from '../../../model/conteudo.model';
import { Atividade } from '../../../model/atividade.model';
import { EditarPerfilComponent } from '../../../components/editar-perfil/editar-perfil.component';

@Component({
  selector: 'app-aluno-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conteudo.component.html',
  styleUrl: './conteudo.component.css',
})
export class AlunoModuloDetalheComponent implements OnInit {
  userName = signal<string>('Aluno');
  moduloId = 0;
  modulo = signal<Modulo | null>(null);
  licoes = signal<Licao[]>([]);
  conteudosForLicao = signal<{ [key: number]: Conteudo[] }>({});
  atividadesPorLicao = signal<{ [key: number]: Atividade[] }>({});

  /** Índice da lição exibida atualmente (paginação) */
  licaoAtualIndex = signal<number>(0);

  /** IDs dos conteúdos que o aluno já marcou como concluídos (persistido no banco) */
  conteudosConcluidos = signal<number[]>([]);

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
  private atividadeService = inject(AtividadeService);
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

      // Carregar atividades do módulo (somente as que não estão concluídas)
      const allAtividades = await this.atividadeService.getAtividades();
      const mappedAtividades: { [key: number]: Atividade[] } = {};
      allAtividades
        .filter((a: Atividade) => a.status !== 'feito')
        .forEach((a: Atividade) => {
          if (!mappedAtividades[a.licao_id]) {
            mappedAtividades[a.licao_id] = [];
          }
          mappedAtividades[a.licao_id].push(a);
        });
      this.atividadesPorLicao.set(mappedAtividades);

      // Carregar progresso dos conteúdos do banco
      const concluidos = await this.conteudoService.getProgressoConteudos(this.moduloId);
      this.conteudosConcluidos.set(concluidos);

      const conteudoIds = allConteudos.map(c => c.conteudo_id);
      const comentariosCarregados = await this.alunoService.getComentariosDoAluno(conteudoIds);
      this.comentarios.set(comentariosCarregados);
      this.comentarioSalvo.set(comentariosCarregados);

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

  /** Verifica se um conteúdo individual foi marcado como concluído */
  isConteudoConcluido(conteudoId: number): boolean {
    return this.conteudosConcluidos().includes(conteudoId);
  }

  /** Marca um conteúdo como visto/concluído no banco */
  async marcarConteudoConcluido(conteudoId: number): Promise<void> {
    if (this.isConteudoConcluido(conteudoId)) return; // já concluído
    try {
      await this.conteudoService.concluirConteudo(conteudoId);
      this.conteudosConcluidos.update(atuais => [...atuais, conteudoId]);
    } catch (err: unknown) {
      console.error('Erro ao marcar conteúdo como concluído:', err);
    }
  }

  /**
   * A lição é considerada concluída quando TODOS os seus conteúdos foram marcados.
   * Se a lição não tem conteúdos, considera-se inconcluída.
   */
  isConcluida(licaoId: number): boolean {
    const conteudosDaLicao = this.conteudosForLicao()[licaoId] ?? [];
    if (conteudosDaLicao.length === 0) return false;
    return conteudosDaLicao.every(c => this.isConteudoConcluido(c.conteudo_id));
  }

  getAtividadeDaLicao(licaoId: number): Atividade | null {
    const atividades = this.atividadesPorLicao()[licaoId] ?? [];
    if (atividades.length === 0) return null;
    const pendente = atividades.find(a => a.status === 'a_fazer' || a.status === 'fazendo');
    return pendente ?? atividades[0];
  }

  getBotaoAtividadeLabel(licaoId: number): string {
    const atividade = this.getAtividadeDaLicao(licaoId);
    if (!atividade) return 'Realizar atividade';
    if (atividade.status === 'fazendo') return 'Continuar atividade';
    return 'Realizar atividade';
  }

  realizarAtividade(licaoId: number) {
    const atividade = this.getAtividadeDaLicao(licaoId);
    if (!atividade) return;
    this.router.navigate(['/aluno-idoso/atividade', atividade.atividade_id]);
  }


  proximaLicao(): void {
    if (this.licaoAtualIndex() < this.licoes().length - 1) {
      this.licaoAtualIndex.update(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  licaoAnterior(): void {
    if (this.licaoAtualIndex() > 0) {
      this.licaoAtualIndex.update(i => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get licaoAtual() {
    return this.licoes()[this.licaoAtualIndex()] ?? null;
  }
  async marcarLicaoConcluida(licaoId: number): Promise<void> {
    if (this.isConcluida(licaoId)) return; // já concluída
    const conteudosDaLicao = this.conteudosForLicao()[licaoId] ?? [];
    const pendentes = conteudosDaLicao.filter(c => !this.isConteudoConcluido(c.conteudo_id));
    await Promise.all(pendentes.map(c => this.marcarConteudoConcluido(c.conteudo_id)));
  }
  // Métodos auxiliares de progresso e comentários
  get totalConcluidas(): number {
    return this.licoes().filter(l => this.isConcluida(l.licao_id)).length;
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

  todasLicoesConcluidas(): boolean {
    const total = this.licoes().length;
    return total > 0 && this.totalConcluidas === total;
  }

  seguirParaAtividade(): void {
    this.router.navigate(['/aluno-idoso/atividades'], { queryParams: { moduloId: this.moduloId } });
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

  voltar() {
    this.router.navigate(['/aluno-idoso'], { queryParams: { view: 'modulos' } });
  }

  irParaView(view: string) {
    this.router.navigate(['/aluno-idoso'], { queryParams: { view } });
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
