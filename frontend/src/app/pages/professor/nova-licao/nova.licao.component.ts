import { Component, EventEmitter, Input, Output, signal, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProfessorService } from '../../../services/professor.service';
import { LicaoService } from '../../../services/licao.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { AtividadeService } from '../../../services/atividade.service';
import { Licao } from '../../../model/licao.model';
import { Conteudo } from '../../../model/conteudo.model';
import { Atividade, OpcaoAtividade, ItemPar, ParAssociacao } from '../../../model/atividade.model';
import { environment } from '../../../../environments/environment';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

type OpcaoId = 'a' | 'b' | 'c' | 'd';

interface AtividadeFormOpcoes {
  a: string;
  b: string;
  c: string;
  d: string;
}

type TipoQuestao = 'multipla_escolha' | 'associacao_imagens';

interface QuestaoForm {
  tipo: TipoQuestao;
  enunciado: string;
  explicacao: string;
  opcoes: AtividadeFormOpcoes;
  respostaCorreta: OpcaoId;
  pares: ParAssociacao[];
}

// Limite de itens por lição, só para a tela não crescer demais.
const MAX_ITENS_POR_LICAO = 5;

function novaQuestaoVazia(): QuestaoForm {
  return {
    tipo: 'multipla_escolha',
    enunciado: '',
    explicacao: '',
    opcoes: { a: '', b: '', c: '', d: '' },
    respostaCorreta: 'a',
    pares: [],
  };
}

interface ConteudoForm {
  texto: string;
  midiaType: string;
  url: string;
}

function novoConteudoVazio(): ConteudoForm {
  return { texto: '', midiaType: 'Texto', url: '' };
}

@Component({
  selector: 'app-nova-licao',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent],
  templateUrl: './nova-licao.component.html',
  styleUrl: './nova.licao.component.scss',
})
export class NovaLicaoComponent implements OnInit, OnChanges {
  /** Id do módulo ao qual as lições pertencem. */
  @Input({ required: true }) moduloId!: number;

  /** Disparado quando uma lição é criada com sucesso. */
  @Output() licaoCriada = new EventEmitter<void>();

  private professorService = inject(ProfessorService);
  private licaoService = inject(LicaoService);
  private conteudoService = inject(ConteudoService);
  private atividadeService = inject(AtividadeService);
  private cdr = inject(ChangeDetectorRef);

  readonly maxItensPorLicao = MAX_ITENS_POR_LICAO;
  readonly opcaoIds: OpcaoId[] = ['a', 'b', 'c', 'd'];
  readonly opcaoLabels = ['A', 'B', 'C', 'D'];

  // --- Dados carregados do módulo ---
  licoes = signal<Licao[]>([]);
  conteudosForLicao = signal<{ [licaoId: number]: Conteudo[] }>({});
  atividadesForLicao = signal<{ [licaoId: number]: Atividade[] }>({});
  loadingItens = signal<boolean>(false);

  // --- Paginação ---
  paginaAtual = signal<number>(1);
  itensPorPagina = signal<number>(6);

  totalPaginas = computed(() => {
    return Math.ceil(this.licoes().length / this.itensPorPagina()) || 1;
  });

  licoesOrdenadas = computed(() => {
    return [...this.licoes()].sort((a, b) => a.titulo_licao.localeCompare(b.titulo_licao));
  });

  licoesPaginadas = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    const fim = inicio + this.itensPorPagina();
    return this.licoesOrdenadas().slice(inicio, fim);
  });

  mudarPagina(page: number) {
    if (page >= 1 && page <= this.totalPaginas()) {
      this.paginaAtual.set(page);
    }
  }

  // --- Expansão dos cards de lição ---
  private expandedLicoesSet = signal<Set<number>>(new Set());

  // --- Modal: Nova Lição ---
  showLicaoForm = signal<boolean>(false);
  titulo = '';
  comentario = '';
  conteudosForm: ConteudoForm[] = [novoConteudoVazio()];
  saving = signal<boolean>(false);
  error = signal<string | null>(null);

  // --- Modal: Nova Atividade (com múltiplas questões) ---
  showAtividadeForm = signal<boolean>(false);
  atividadeLicaoId: number | null = null;
  atividadeTitulo = '';
  atividadeQuestoes: QuestaoForm[] = [novaQuestaoVazia()];
  atividadeError = signal<string | null>(null);
  savingAtividade = signal<boolean>(false);

  // --- Modal: Editar Conteúdo ---
  showEditConteudoForm = signal<boolean>(false);
  editConteudoTarget = signal<Conteudo | null>(null);
  editConteudoTexto = '';
  editConteudoMidiaType = 'Texto';
  editConteudoUrl = '';
  editConteudoError = signal<string | null>(null);
  savingEditConteudo = signal<boolean>(false);

  // --- Modal: Editar Atividade ---
  showEditAtividadeForm = signal<boolean>(false);
  editAtividadeTarget = signal<Atividade | null>(null);
  editAtividadeTitulo = '';
  editAtividadeQuestao: QuestaoForm = novaQuestaoVazia();
  editAtividadeError = signal<string | null>(null);
  savingEditAtividade = signal<boolean>(false);

  ngOnInit() {
    this.loadItens();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['moduloId'] && !changes['moduloId'].firstChange) {
      this.loadItens();
    }
  }

  async loadItens() {
    if (!this.moduloId) return;
    try {
      this.loadingItens.set(true);

      const allLicoes = await this.licaoService.getLicoes();
      const licoesDoModulo = allLicoes.filter(l => l.modulo_id === this.moduloId);
      this.licoes.set(licoesDoModulo);

      const licaoIds = new Set(licoesDoModulo.map(l => l.licao_id));

      const allConteudos = await this.conteudoService.getConteudos();
      const mappedConteudos: { [licaoId: number]: Conteudo[] } = {};
      allConteudos
        .filter(c => licaoIds.has(c.licao_id))
        .forEach(c => {
          if (!mappedConteudos[c.licao_id]) mappedConteudos[c.licao_id] = [];
          mappedConteudos[c.licao_id].push(c);
        });
      this.conteudosForLicao.set(mappedConteudos);

      const allAtividades = await this.atividadeService.getAtividades();
      const mappedAtividades: { [licaoId: number]: Atividade[] } = {};
      allAtividades
        .filter(a => licaoIds.has(a.licao_id))
        .forEach(a => {
          if (!mappedAtividades[a.licao_id]) mappedAtividades[a.licao_id] = [];
          mappedAtividades[a.licao_id].push(a);
        });
      this.atividadesForLicao.set(mappedAtividades);

    } catch (err: unknown) {
      console.error(getErrorMessage(err, 'Erro ao carregar itens do módulo.'));
    } finally {
      this.loadingItens.set(false);
    }
  }

  countConteudos(licaoId: number): number {
    return this.conteudosForLicao()[licaoId]?.length || 0;
  }

  countAtividades(licaoId: number): number {
    return this.atividadesForLicao()[licaoId]?.length || 0;
  }

  atividadeLimiteAtingido(licaoId: number | null): boolean {
    if (licaoId === null) return false;
    return this.countAtividades(licaoId) >= this.maxItensPorLicao;
  }

  // --- Expansão dos cards de lição ---

  isLicaoExpanded(licaoId: number): boolean {
    return this.expandedLicoesSet().has(licaoId);
  }

  toggleLicaoExpand(licaoId: number) {
    const next = new Set(this.expandedLicoesSet());
    if (next.has(licaoId)) {
      next.delete(licaoId);
    } else {
      next.add(licaoId);
    }
    this.expandedLicoesSet.set(next);
  }

  // --- Toggle dos modais ---

  toggleLicaoForm() {
    const next = !this.showLicaoForm();
    this.showLicaoForm.set(next);
    if (next) {
      this.error.set(null);
      this.titulo = '';
      this.comentario = '';
      this.conteudosForm = [novoConteudoVazio()];
    }
  }

  toggleAtividadeForm() {
    const next = !this.showAtividadeForm();
    this.showAtividadeForm.set(next);
    if (next) {
      this.atividadeError.set(null);
      this.atividadeLicaoId = this.licoes()[0]?.licao_id ?? null;
      this.atividadeTitulo = '';
      this.atividadeQuestoes = [novaQuestaoVazia()];
    }
  }

  // --- Submits (chamados pelo (ngSubmit) dos <form> no template) ---
  // ✅ Garante que, ao clicar em "Criar Lição"/"Salvar Atividade" sem preencher nada,
  //    TODOS os campos exibam erro de uma vez (não só os que o usuário já tocou).

  onSubmitLicao(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    this.criarLicao();
  }

  onSubmitAtividade(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    this.adicionarAtividade();
  }

  // --- Criar Lição ---

  async criarLicao() {
    this.error.set(null);

    if (!this.titulo.trim()) {
      this.error.set('O título da lição é obrigatório.');
      return;
    }

    if (!this.comentario.trim()) {
      this.error.set('A descrição da lição é obrigatória.');
      return;
    }

    for (const c of this.conteudosForm) {
      if (!c.texto.trim()) {
        this.error.set('O texto de um dos conteúdos está vazio.');
        return;
      }
      if (c.midiaType !== 'Texto' && !c.url.trim()) {
        this.error.set('Um dos conteúdos tem tipo de mídia selecionado sem URL.');
        return;
      }
    }

    try {
      this.saving.set(true);

      const licao = await this.licaoService.createLicao({
        titulo_licao: this.titulo.trim(),
        comentario: this.comentario.trim() || undefined,
        modulo_id: this.moduloId,
      });

      for (const c of this.conteudosForm) {
        const hasText = c.texto.trim().length > 0;
        const hasMedia = c.midiaType !== 'Texto' && c.url.trim().length > 0;
        if (hasText || hasMedia) {
          await this.conteudoService.createConteudo({
            nome_conteudo: `Conteúdo da Lição: ${licao.titulo_licao}`,
            tipo_conteudo: c.midiaType,
            url_conteudo: c.midiaType !== 'Texto' ? c.url.trim() : undefined,
            texto_conteudo: hasText ? c.texto.trim() : undefined,
            licao_id: licao.licao_id,
          });
        }
      }

      this.showLicaoForm.set(false);
      await this.loadItens();
      this.licaoCriada.emit();
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao criar lição.'));
    } finally {
      this.saving.set(false);
    }
  }

  async deleteLicao(licaoId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Deseja realmente excluir esta lição? Todos os conteúdos e atividades dela também serão excluídos.')) return;
    try {
      await this.licaoService.deleteLicao(licaoId);
      await this.loadItens();
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao excluir lição.'));
    }
  }

  // --- Conteúdos dentro do modal de Nova Lição ---

  addConteudo(): void {
    this.conteudosForm.push(novoConteudoVazio());
  }

  removeConteudo(index: number): void {
    if (this.conteudosForm.length > 1) {
      this.conteudosForm.splice(index, 1);
    }
  }

  async deleteConteudo(conteudoId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Deseja realmente excluir este conteúdo?')) return;
    try {
      await this.conteudoService.deleteConteudo(conteudoId);
      await this.loadItens();
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao excluir conteúdo.'));
    }
  }

  // --- Nova Atividade: gestão das questões dentro do modal ---

  addQuestao() {
    this.atividadeQuestoes.push(novaQuestaoVazia());
  }

  removeQuestao(index: number) {
    if (this.atividadeQuestoes.length <= 1) return;
    this.atividadeQuestoes.splice(index, 1);
  }

  addParImagem(questao: QuestaoForm) {
    questao.pares.push({
      esquerdo: { tipo: 'texto', texto: '', imagem_url: '' },
      direito: { tipo: 'texto', texto: '', imagem_url: '' },
    });
  }

  removeParImagem(questao: QuestaoForm, index: number) {
    questao.pares.splice(index, 1);
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  async onFileSelected(event: any, item: ItemPar) {
    const file: File = event.target.files[0];
    if (!file) return;

    try {
      item.uploading = true;
      this.cdr.detectChanges();
      const res = await this.professorService.uploadImage(file);
      item.imagem_url = res.url;
    } catch (err: any) {
      this.atividadeError.set(err.message || 'Erro ao enviar imagem');
    } finally {
      item.uploading = false;
      this.cdr.detectChanges();
    }
  }

  private validarQuestao(questao: QuestaoForm, indice: number): OpcaoAtividade[] | ParAssociacao[] | null {
    if (!questao.enunciado.trim()) {
      this.atividadeError.set(`Preencha o enunciado da questão ${indice + 1}.`);
      return null;
    }

    if (questao.tipo === 'multipla_escolha') {
      const opcoesPreenchidas: OpcaoAtividade[] = this.opcaoIds
        .filter(id => questao.opcoes[id].trim().length > 0)
        .map(id => ({
          letra: id,
          texto_opcao: questao.opcoes[id].trim(),
          correta: id === questao.respostaCorreta,
        }));

      if (opcoesPreenchidas.length < 2) {
        this.atividadeError.set(`A questão ${indice + 1} precisa de pelo menos 2 opções.`);
        return null;
      }

      if (!opcoesPreenchidas.some(o => o.letra === questao.respostaCorreta)) {
        this.atividadeError.set(`A resposta correta da questão ${indice + 1} precisa ser uma opção preenchida.`);
        return null;
      }

      if (!questao.explicacao.trim()) {
        this.atividadeError.set(`Adicione uma explicação da resposta correta para a questão ${indice + 1}.`);
        return null;
      }

      return opcoesPreenchidas;
    }

    // associacao_imagens
    if (questao.pares.length < 2) {
      this.atividadeError.set(`A questão ${indice + 1} (associação) precisa de pelo menos 2 pares.`);
      return null;
    }

    for (const p of questao.pares) {
      if (p.esquerdo.tipo === 'texto' && !p.esquerdo.texto?.trim()) {
        this.atividadeError.set(`Preencha o texto esquerdo de um par na questão ${indice + 1}.`);
        return null;
      }
      if (p.esquerdo.tipo === 'imagem' && !p.esquerdo.imagem_url?.trim()) {
        this.atividadeError.set(`Envie a imagem esquerda de um par na questão ${indice + 1}.`);
        return null;
      }
      if (p.direito.tipo === 'texto' && !p.direito.texto?.trim()) {
        this.atividadeError.set(`Preencha o texto direito de um par na questão ${indice + 1}.`);
        return null;
      }
      if (p.direito.tipo === 'imagem' && !p.direito.imagem_url?.trim()) {
        this.atividadeError.set(`Envie a imagem direita de um par na questão ${indice + 1}.`);
        return null;
      }
    }

    return questao.pares.map(p => ({
      esquerdo: {
        tipo: p.esquerdo.tipo,
        texto: p.esquerdo.tipo === 'texto' ? p.esquerdo.texto : undefined,
        imagem_url: p.esquerdo.tipo === 'imagem' ? p.esquerdo.imagem_url : undefined,
      },
      direito: {
        tipo: p.direito.tipo,
        texto: p.direito.tipo === 'texto' ? p.direito.texto : undefined,
        imagem_url: p.direito.tipo === 'imagem' ? p.direito.imagem_url : undefined,
      },
    }));
  }

  // Nota: o backend guarda 1 questão por registro de Atividade.
  // Uma "atividade" com várias questões vira N registros criados em sequência,
  // todos com o mesmo título e numerados no enunciado, para agrupar visualmente.
  async adicionarAtividade() {
    this.atividadeError.set(null);

    if (this.atividadeLicaoId === null) {
      this.atividadeError.set('Selecione a lição.');
      return;
    }

    if (!this.atividadeTitulo.trim()) {
      this.atividadeError.set('O título da atividade é obrigatório.');
      return;
    }

    const vagasRestantes = this.maxItensPorLicao - this.countAtividades(this.atividadeLicaoId);
    if (vagasRestantes <= 0) {
      this.atividadeError.set(`Essa lição já atingiu o limite de ${this.maxItensPorLicao} atividades.`);
      return;
    }

    if (this.atividadeQuestoes.length > vagasRestantes) {
      this.atividadeError.set(
        `Essa lição só tem espaço para mais ${vagasRestantes} atividade(s), mas você adicionou ${this.atividadeQuestoes.length} questões.`
      );
      return;
    }

    const payloads: { enunciado: string; explicacao?: string; tipo: TipoQuestao; opcoes?: OpcaoAtividade[]; pares?: ParAssociacao[] }[] = [];

    for (let i = 0; i < this.atividadeQuestoes.length; i++) {
      const questao = this.atividadeQuestoes[i];
      const resultado = this.validarQuestao(questao, i);
      if (resultado === null) return;

      if (questao.tipo === 'multipla_escolha') {
        payloads.push({ enunciado: questao.enunciado.trim(), explicacao: questao.explicacao.trim(), tipo: questao.tipo, opcoes: resultado as OpcaoAtividade[] });
      } else {
        payloads.push({ enunciado: questao.enunciado.trim(), tipo: questao.tipo, pares: resultado as ParAssociacao[] });
      }
    }

    try {
      this.savingAtividade.set(true);

      const multiQuestao = payloads.length > 1;
      for (let i = 0; i < payloads.length; i++) {
        const p = payloads[i];
        await this.atividadeService.createAtividade({
          titulo_atividade: multiQuestao ? `${this.atividadeTitulo.trim()} - Questão ${i + 1}` : this.atividadeTitulo.trim(),
          tipo_atividade: p.tipo,
          enunciado: p.enunciado,
          explicacao: p.explicacao ?? null,
          opcoes: p.opcoes,
          pares_associacao: p.pares,
          licao_id: this.atividadeLicaoId!,
        });
      }

      this.showAtividadeForm.set(false);
      await this.loadItens();
    } catch (err: unknown) {
      this.atividadeError.set(getErrorMessage(err, 'Erro ao adicionar atividade.'));
    } finally {
      this.savingAtividade.set(false);
    }
  }

  async deleteAtividade(atividadeId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Deseja realmente excluir esta atividade?')) return;
    try {
      await this.atividadeService.deleteAtividade(atividadeId);
      await this.loadItens();
    } catch (err: unknown) {
      this.atividadeError.set(getErrorMessage(err, 'Erro ao excluir atividade.'));
    }
  }

  // --- Helpers de exibição nos cards ---

  getTipoAtividadeLabel(tipo: string): string {
    if (tipo === 'multipla_escolha') return 'Múltipla Escolha';
    if (tipo === 'associacao_imagens') return 'Associação de Imagens';
    return tipo;
  }

  // --- Editar Conteúdo ---

  openEditConteudo(c: Conteudo, event: Event) {
    event.stopPropagation();
    this.editConteudoTarget.set(c);
    this.editConteudoTexto = c.texto_conteudo ?? '';
    this.editConteudoMidiaType = c.tipo_conteudo ?? 'Texto';
    this.editConteudoUrl = c.url_conteudo ?? '';
    this.editConteudoError.set(null);
    this.showEditConteudoForm.set(true);
  }

  closeEditConteudo() {
    this.showEditConteudoForm.set(false);
    this.editConteudoTarget.set(null);
  }

  async salvarEdicaoConteudo() {
    const target = this.editConteudoTarget();
    if (!target) return;
    if (this.editConteudoMidiaType !== 'Texto' && !this.editConteudoUrl.trim()) {
      this.editConteudoError.set('Informe a URL da mídia.');
      return;
    }
    try {
      this.savingEditConteudo.set(true);
      this.editConteudoError.set(null);
      await this.conteudoService.updateConteudo(target.conteudo_id, {
        texto_conteudo: this.editConteudoTexto.trim() || null,
        tipo_conteudo: this.editConteudoMidiaType,
        url_conteudo: this.editConteudoMidiaType !== 'Texto' ? this.editConteudoUrl.trim() : null,
      });
      this.closeEditConteudo();
      await this.loadItens();
    } catch (err: unknown) {
      this.editConteudoError.set(getErrorMessage(err, 'Erro ao atualizar conteúdo.'));
    } finally {
      this.savingEditConteudo.set(false);
    }
  }

  // --- Editar Atividade ---

  openEditAtividade(a: Atividade, event: Event) {
    event.stopPropagation();
    this.editAtividadeTarget.set(a);
    this.editAtividadeTitulo = a.titulo_atividade;
    this.editAtividadeError.set(null);

    const q: QuestaoForm = novaQuestaoVazia();
    q.tipo = a.tipo_atividade as TipoQuestao;
    q.enunciado = a.enunciado ?? '';
    q.explicacao = a.explicacao ?? '';

    if (a.tipo_atividade === 'multipla_escolha' && a.opcoes) {
      const ids: OpcaoId[] = ['a', 'b', 'c', 'd'];
      a.opcoes.forEach((op, i) => {
        const key = (op.letra ?? ids[i]) as OpcaoId;
        q.opcoes[key] = op.texto_opcao;
        if (op.correta) q.respostaCorreta = key;
      });
    } else if (a.tipo_atividade === 'associacao_imagens') {
      q.pares = (a.pares_associacao ?? []).map(p => ({
        esquerdo: { tipo: p.esquerdo.tipo, texto: p.esquerdo.texto ?? '', imagem_url: p.esquerdo.imagem_url ?? '' },
        direito:  { tipo: p.direito.tipo,  texto: p.direito.texto  ?? '', imagem_url: p.direito.imagem_url  ?? '' },
      }));
    }

    this.editAtividadeQuestao = q;
    this.showEditAtividadeForm.set(true);
  }

  closeEditAtividade() {
    this.showEditAtividadeForm.set(false);
    this.editAtividadeTarget.set(null);
  }

  async salvarEdicaoAtividade() {
    const target = this.editAtividadeTarget();
    if (!target) return;
    if (!this.editAtividadeTitulo.trim()) {
      this.editAtividadeError.set('O título da atividade é obrigatório.');
      return;
    }
    const resultado = this.validarQuestao(this.editAtividadeQuestao, 0);
    if (resultado === null) return;

    // Re-use the atividadeError signal for validation feedback from validarQuestao
    if (this.atividadeError()) {
      this.editAtividadeError.set(this.atividadeError());
      this.atividadeError.set(null);
      return;
    }

    try {
      this.savingEditAtividade.set(true);
      this.editAtividadeError.set(null);
      const q = this.editAtividadeQuestao;
      await this.atividadeService.updateAtividade(target.atividade_id, {
        titulo_atividade: this.editAtividadeTitulo.trim(),
        enunciado: q.enunciado.trim(),
        explicacao: q.tipo === 'multipla_escolha' ? q.explicacao.trim() : null,
        opcoes: q.tipo === 'multipla_escolha' ? (resultado as OpcaoAtividade[]) : undefined,
        pares_associacao: q.tipo === 'associacao_imagens' ? (resultado as ParAssociacao[]) : undefined,
      });
      this.closeEditAtividade();
      await this.loadItens();
    } catch (err: unknown) {
      this.editAtividadeError.set(getErrorMessage(err, 'Erro ao atualizar atividade.'));
    } finally {
      this.savingEditAtividade.set(false);
    }
  }
}