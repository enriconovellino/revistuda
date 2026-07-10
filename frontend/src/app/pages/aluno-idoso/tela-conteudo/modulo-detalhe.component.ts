import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlunoService, Conteudo } from '../../../services/aluno.service';
import { Modulo, Licao } from '../../../model/aluno.model';

@Component({
  selector: 'app-aluno-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulo-detalhe.component.html',
  styleUrl: './modulo-detalhe.component.css',
})
export class AlunoModuloDetalheComponent implements OnInit {
  userName = signal<string>('Aluno');
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
  private sanitizer = inject(DomSanitizer);

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

      const mod = await this.alunoService.getModuloById(this.moduloId);
      this.modulo.set(mod);

      const allLicoes = await this.alunoService.getLicoes();
      const filteredLicoes = allLicoes.filter(l => l.modulo_id === this.moduloId);
      this.licoes.set(filteredLicoes);

      const allConteudos = await this.alunoService.getConteudos();
      const mappedConteudos: { [key: number]: Conteudo[] } = {};
      allConteudos.forEach(c => {
        if (!mappedConteudos[c.licao_id]) {
          mappedConteudos[c.licao_id] = [];
        }
        if (c.url_conteudo) {
          c.safeUrl = this.getSafeYouTubeUrl(c.url_conteudo);
        }
        mappedConteudos[c.licao_id].push(c);
      });
      this.conteudosForLicao.set(mappedConteudos);

      const conteudoIds = allConteudos.map(c => c.conteudo_id);
      const comentariosCarregados = await this.alunoService.getComentariosDoAluno(conteudoIds);
    
      this.comentarios.set(comentariosCarregados);
      this.comentarioSalvo.set(comentariosCarregados);

      this.licoesConcluidas.set(this.alunoService.getLicoesConcluidas(this.moduloId));

    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar os dados do módulo.');
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

  toggleConcluida(licaoId: number) {
    const atualizadas = this.alunoService.toggleLicaoConcluida(this.moduloId, licaoId);
    this.licoesConcluidas.set(atualizadas);
  }

  get totalConcluidas(): number {
    return this.licoesConcluidas().length;
  }

  
  getComentario(conteudoId: number): string {
    return this.comentarios()[conteudoId] || '';
  }

  onComentarioChange(conteudoId: number, texto: string) {
    this.comentarios.update(atual => ({ ...atual, [conteudoId]: texto }));
  }

  estaEditandoComentario(conteudoId: number): boolean {
    const jaSalvou = !!this.comentarioSalvo()[conteudoId];
    const editando = this.editandoComentario()[conteudoId];

    return !jaSalvou || !!editando;
  }

  abrirEdicaoComentario(conteudoId: number) {
    this.editandoComentario.update(atual => ({ ...atual, [conteudoId]: true }));
  }

  async salvarComentario(conteudoId: number) {
    const texto = this.getComentario(conteudoId);

    try {
      await this.alunoService.saveComentario(conteudoId, texto);
    } catch {
    
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
}