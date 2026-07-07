import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProfessorService } from '../../../services/professor.service';
import { Modulo, Licao, Conteudo, Atividade, DadosMultiplaEscolha, OpcaoMultiplaEscolha } from '../../../model/professor.models';

type OpcaoId = OpcaoMultiplaEscolha['id'];

interface AtividadeFormOpcoes {
  a: string;
  b: string;
  c: string;
  d: string;
}

@Component({
  selector: 'app-modulo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  readonly opcaoIds: OpcaoId[] = ['a', 'b', 'c', 'd'];
  readonly opcaoLabels = ['A', 'B', 'C', 'D'];

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  actionError = signal<string | null>(null);
  saving = signal<boolean>(false);

  newLicaoTitulo = '';
  newLicaoComentario = '';
  newLicaoTexto = '';
  newLicaoUrl = '';
  newLicaoMidiaType = 'Texto';

  activeAddContentLicaoId = signal<number | null>(null);
  addContentTexto = '';
  addContentUrl = '';
  addContentMidiaType = 'Texto';

  activeEditContentId = signal<number | null>(null);
  editContentTexto = '';
  editContentUrl = '';
  editContentMidiaType = 'Texto';

  activeAddAtividadeLicaoId = signal<number | null>(null);
  addAtividadeTitulo = '';
  addAtividadeDescricao = '';
  addAtividadeEnunciado = '';
  addAtividadeOpcoes: AtividadeFormOpcoes = { a: '', b: '', c: '', d: '' };
  addAtividadeRespostaCorreta: OpcaoId = 'a';

  activeEditAtividadeId = signal<number | null>(null);
  editAtividadeTitulo = '';
  editAtividadeDescricao = '';
  editAtividadeEnunciado = '';
  editAtividadeOpcoes: AtividadeFormOpcoes = { a: '', b: '', c: '', d: '' };
  editAtividadeRespostaCorreta: OpcaoId = 'a';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private professorService = inject(ProfessorService);
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

  getSafeYouTubeUrl(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${match[2]}`);
    }
    return null;
  }

  async createLicao() {
    this.actionError.set(null);
    if (!this.newLicaoTitulo.trim()) {
      this.actionError.set('O título da lição é obrigatório.');
      return;
    }

    const hasText = this.newLicaoTexto.trim().length > 0;
    const hasMedia = this.newLicaoMidiaType !== 'Texto' && this.newLicaoUrl.trim().length > 0;

    if (this.newLicaoMidiaType !== 'Texto' && !this.newLicaoUrl.trim()) {
      this.actionError.set('Você selecionou um tipo de mídia, mas não inseriu a URL.');
      return;
    }

    try {
      this.saving.set(true);

      const licao = await this.professorService.createLicao({
        titulo_licao: this.newLicaoTitulo.trim(),
        comentario: this.newLicaoComentario.trim() || undefined,
        modulo_id: this.moduloId
      });

      if (hasText || hasMedia) {
        await this.professorService.createConteudo({
          nome_conteudo: `Conteúdo da Lição: ${licao.titulo_licao}`,
          tipo_conteudo: this.newLicaoMidiaType,
          url_conteudo: this.newLicaoMidiaType !== 'Texto' ? this.newLicaoUrl.trim() : undefined,
          texto_conteudo: hasText ? this.newLicaoTexto.trim() : undefined,
          licao_id: licao.licao_id
        });
      }

      this.newLicaoTitulo = '';
      this.newLicaoComentario = '';
      this.newLicaoTexto = '';
      this.newLicaoUrl = '';
      this.newLicaoMidiaType = 'Texto';

      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao criar lição.');
    } finally {
      this.saving.set(false);
    }
  }

  toggleAddContentForm(licaoId: number) {
    if (this.activeAddContentLicaoId() === licaoId) {
      this.activeAddContentLicaoId.set(null);
    } else {
      this.activeAddContentLicaoId.set(licaoId);
      this.addContentTexto = '';
      this.addContentUrl = '';
      this.addContentMidiaType = 'Texto';
    }
  }

  async addConteudo(licaoId: number) {
    this.actionError.set(null);
    const hasText = this.addContentTexto.trim().length > 0;
    const hasMedia = this.addContentMidiaType !== 'Texto' && this.addContentUrl.trim().length > 0;

    if (!hasText && !hasMedia) {
      this.actionError.set('Preencha o texto e/ou a URL da mídia para adicionar o conteúdo.');
      return;
    }

    if (this.addContentMidiaType !== 'Texto' && !this.addContentUrl.trim()) {
      this.actionError.set('URL do conteúdo é obrigatória para mídia.');
      return;
    }

    try {
      this.saving.set(true);
      const licao = this.licoes().find(l => l.licao_id === licaoId);

      await this.professorService.createConteudo({
        nome_conteudo: `Conteúdo da Lição: ${licao?.titulo_licao || ''}`,
        tipo_conteudo: this.addContentMidiaType,
        url_conteudo: this.addContentMidiaType !== 'Texto' ? this.addContentUrl.trim() : undefined,
        texto_conteudo: hasText ? this.addContentTexto.trim() : undefined,
        licao_id: licaoId
      });

      this.activeAddContentLicaoId.set(null);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao adicionar conteúdo.');
    } finally {
      this.saving.set(false);
    }
  }

  startEditConteudo(conteudo: Conteudo) {
    this.activeEditContentId.set(conteudo.conteudo_id);
    this.editContentTexto = conteudo.texto_conteudo || '';
    this.editContentUrl = conteudo.url_conteudo || '';
    this.editContentMidiaType = conteudo.tipo_conteudo;
  }

  cancelEditConteudo() {
    this.activeEditContentId.set(null);
  }

  async saveEditConteudo(conteudoId: number) {
    this.actionError.set(null);
    const hasText = this.editContentTexto.trim().length > 0;
    const hasMedia = this.editContentMidiaType !== 'Texto' && this.editContentUrl.trim().length > 0;

    if (!hasText && !hasMedia) {
      this.actionError.set('O conteúdo precisa ter um texto ou uma URL de mídia.');
      return;
    }

    if (this.editContentMidiaType !== 'Texto' && !this.editContentUrl.trim()) {
      this.actionError.set('URL da mídia é obrigatória quando um tipo de mídia é selecionado.');
      return;
    }

    try {
      this.saving.set(true);

      await this.professorService.updateConteudo(conteudoId, {
        texto_conteudo: hasText ? this.editContentTexto.trim() : null,
        url_conteudo: this.editContentMidiaType !== 'Texto' ? this.editContentUrl.trim() : null,
        tipo_conteudo: this.editContentMidiaType
      });

      this.activeEditContentId.set(null);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao atualizar conteúdo.');
    } finally {
      this.saving.set(false);
    }
  }

  private emptyAtividadeOpcoes(): AtividadeFormOpcoes {
    return { a: '', b: '', c: '', d: '' };
  }

  private buildDadosFromForm(
    enunciado: string,
    opcoes: AtividadeFormOpcoes,
    respostaCorreta: OpcaoId,
  ): DadosMultiplaEscolha | null {
    const opcoesPreenchidas = this.opcaoIds
      .filter(id => opcoes[id].trim().length > 0)
      .map(id => ({ id, texto: opcoes[id].trim() }));

    if (!enunciado.trim()) {
      this.actionError.set('O enunciado da atividade é obrigatório.');
      return null;
    }

    if (opcoesPreenchidas.length < 2) {
      this.actionError.set('Preencha pelo menos 2 opções de resposta.');
      return null;
    }

    if (!opcoesPreenchidas.some(o => o.id === respostaCorreta)) {
      this.actionError.set('A resposta correta deve ser uma das opções preenchidas.');
      return null;
    }

    return {
      enunciado: enunciado.trim(),
      opcoes: opcoesPreenchidas,
      resposta_correta: respostaCorreta,
    };
  }

  private fillFormFromDados(dados?: DadosMultiplaEscolha): {
    enunciado: string;
    opcoes: AtividadeFormOpcoes;
    respostaCorreta: OpcaoId;
  } {
    const opcoes = this.emptyAtividadeOpcoes();
    dados?.opcoes.forEach(opcao => {
      opcoes[opcao.id] = opcao.texto;
    });

    return {
      enunciado: dados?.enunciado || '',
      opcoes,
      respostaCorreta: dados?.resposta_correta || 'a',
    };
  }

  getTipoAtividadeLabel(tipo: string): string {
    if (tipo === 'multipla_escolha') return 'Múltipla Escolha';
    return tipo;
  }

  toggleAddAtividadeForm(licaoId: number) {
    if (this.activeAddAtividadeLicaoId() === licaoId) {
      this.activeAddAtividadeLicaoId.set(null);
    } else {
      this.activeAddAtividadeLicaoId.set(licaoId);
      this.addAtividadeTitulo = '';
      this.addAtividadeDescricao = '';
      this.addAtividadeEnunciado = '';
      this.addAtividadeOpcoes = this.emptyAtividadeOpcoes();
      this.addAtividadeRespostaCorreta = 'a';
    }
  }

  async addAtividade(licaoId: number) {
    this.actionError.set(null);

    if (!this.addAtividadeTitulo.trim()) {
      this.actionError.set('O título da atividade é obrigatório.');
      return;
    }

    const dados = this.buildDadosFromForm(
      this.addAtividadeEnunciado,
      this.addAtividadeOpcoes,
      this.addAtividadeRespostaCorreta,
    );
    if (!dados) return;

    try {
      this.saving.set(true);
      await this.professorService.createAtividade({
        titulo_atividade: this.addAtividadeTitulo.trim(),
        descricao_atividade: this.addAtividadeDescricao.trim() || undefined,
        tipo_atividade: 'multipla_escolha',
        dados_atividade: dados,
        licao_id: licaoId,
      });

      this.activeAddAtividadeLicaoId.set(null);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao adicionar atividade.');
    } finally {
      this.saving.set(false);
    }
  }

  startEditAtividade(atividade: Atividade) {
    this.activeEditAtividadeId.set(atividade.atividade_id);
    this.editAtividadeTitulo = atividade.titulo_atividade;
    this.editAtividadeDescricao = atividade.descricao_atividade || '';

    const form = this.fillFormFromDados(atividade.dados_atividade);
    this.editAtividadeEnunciado = form.enunciado;
    this.editAtividadeOpcoes = form.opcoes;
    this.editAtividadeRespostaCorreta = form.respostaCorreta;
  }

  cancelEditAtividade() {
    this.activeEditAtividadeId.set(null);
  }

  async saveEditAtividade(atividadeId: number) {
    this.actionError.set(null);

    if (!this.editAtividadeTitulo.trim()) {
      this.actionError.set('O título da atividade é obrigatório.');
      return;
    }

    const dados = this.buildDadosFromForm(
      this.editAtividadeEnunciado,
      this.editAtividadeOpcoes,
      this.editAtividadeRespostaCorreta,
    );
    if (!dados) return;

    try {
      this.saving.set(true);
      await this.professorService.updateAtividade(atividadeId, {
        titulo_atividade: this.editAtividadeTitulo.trim(),
        descricao_atividade: this.editAtividadeDescricao.trim() || undefined,
        tipo_atividade: 'multipla_escolha',
        dados_atividade: dados,
      });

      this.activeEditAtividadeId.set(null);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao atualizar atividade.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteAtividade(atividadeId: number) {
    if (!confirm('Deseja realmente excluir esta atividade?')) {
      return;
    }

    this.actionError.set(null);
    try {
      this.saving.set(true);
      await this.professorService.deleteAtividade(atividadeId);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao excluir atividade.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteConteudo(conteudoId: number) {
    if (!confirm('Deseja realmente excluir este conteúdo específico?')) {
      return;
    }

    this.actionError.set(null);
    try {
      this.saving.set(true);
      await this.professorService.deleteConteudo(conteudoId);
      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao excluir conteúdo.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteLicao(licaoId: number) {
    if (!confirm('Tem certeza que deseja excluir esta lição? Todos os conteúdos e atividades associados serão apagados.')) {
      return;
    }

    this.actionError.set(null);
    try {
      this.saving.set(true);

      // Delete all associated Conteudos sequentially
      const assocContents = this.conteudosForLicao()[licaoId] || [];
      for (const content of assocContents) {
        await this.professorService.deleteConteudo(content.conteudo_id);
      }

      const assocAtividades = this.atividadesForLicao()[licaoId] || [];
      for (const atividade of assocAtividades) {
        await this.professorService.deleteAtividade(atividade.atividade_id);
      }

      await this.professorService.deleteLicao(licaoId);

      await this.loadData();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao excluir lição.');
    } finally {
      this.saving.set(false);
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
