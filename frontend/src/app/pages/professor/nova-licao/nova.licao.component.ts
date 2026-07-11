import { Component, EventEmitter, Input, Output, signal, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService } from '../../../services/professor.service';
import { AtividadeService } from '../../../services/atividade.service';
import { Licao } from '../../../model/licao.model';
import { Conteudo } from '../../../model/conteudo.model';
import { Atividade, OpcaoAtividade, ItemPar, ParAssociacao } from '../../../model/atividade.model';
import { environment } from '../../../../environments/environment';

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
    opcoes: { a: '', b: '', c: '', d: '' },
    respostaCorreta: 'a',
    pares: [],
  };
}

@Component({
  selector: 'app-nova-licao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-licao.component.html',
  styleUrl: './nova.licao.component.scss',
})
export class NovaLicaoComponent implements OnInit, OnChanges {
  /** Id do módulo ao qual as lições pertencem. */
  @Input({ required: true }) moduloId!: number;

  /** Disparado quando uma lição é criada com sucesso. */
  @Output() licaoCriada = new EventEmitter<void>();

  private professorService = inject(ProfessorService);
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

  // --- Expansão dos cards de lição ---
  private expandedLicoesSet = signal<Set<number>>(new Set());

  // --- Modal: Nova Lição ---
  showLicaoForm = signal<boolean>(false);
  titulo = '';
  comentario = '';
  texto = '';
  url = '';
  midiaType = 'Texto';
  saving = signal<boolean>(false);
  error = signal<string | null>(null);

  // --- Modal: Novo Conteúdo ---
  showConteudoForm = signal<boolean>(false);
  conteudoLicaoId: number | null = null;
  conteudoTexto = '';
  conteudoUrl = '';
  conteudoMidiaType = 'Texto';
  conteudoError = signal<string | null>(null);
  savingConteudo = signal<boolean>(false);

  // --- Modal: Nova Atividade (com múltiplas questões) ---
  showAtividadeForm = signal<boolean>(false);
  atividadeLicaoId: number | null = null;
  atividadeTitulo = '';
  atividadeQuestoes: QuestaoForm[] = [novaQuestaoVazia()];
  atividadeError = signal<string | null>(null);
  savingAtividade = signal<boolean>(false);

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

      const allLicoes = await this.professorService.getLicoes();
      const licoesDoModulo = allLicoes.filter(l => l.modulo_id === this.moduloId);
      this.licoes.set(licoesDoModulo);

      const licaoIds = new Set(licoesDoModulo.map(l => l.licao_id));

      const allConteudos = await this.professorService.getConteudos();
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

  conteudoLimiteAtingido(licaoId: number | null): boolean {
    if (licaoId === null) return false;
    return this.countConteudos(licaoId) >= this.maxItensPorLicao;
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
      this.texto = '';
      this.url = '';
      this.midiaType = 'Texto';
    }
  }

  toggleConteudoForm() {
    const next = !this.showConteudoForm();
    this.showConteudoForm.set(next);
    if (next) {
      this.conteudoError.set(null);
      this.conteudoLicaoId = this.licoes()[0]?.licao_id ?? null;
      this.conteudoTexto = '';
      this.conteudoUrl = '';
      this.conteudoMidiaType = 'Texto';
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

  // --- Criar Lição ---

  async criarLicao() {
    this.error.set(null);

    if (!this.titulo.trim()) {
      this.error.set('O título da lição é obrigatório.');
      return;
    }

    const hasText = this.texto.trim().length > 0;
    const hasMedia = this.midiaType !== 'Texto' && this.url.trim().length > 0;

    if (this.midiaType !== 'Texto' && !this.url.trim()) {
      this.error.set('Você selecionou um tipo de mídia, mas não inseriu a URL.');
      return;
    }

    try {
      this.saving.set(true);

      const licao = await this.professorService.createLicao({
        titulo_licao: this.titulo.trim(),
        comentario: this.comentario.trim() || undefined,
        modulo_id: this.moduloId,
      });

      if (hasText || hasMedia) {
        await this.professorService.createConteudo({
          nome_conteudo: `Conteúdo da Lição: ${licao.titulo_licao}`,
          tipo_conteudo: this.midiaType,
          url_conteudo: this.midiaType !== 'Texto' ? this.url.trim() : undefined,
          texto_conteudo: hasText ? this.texto.trim() : undefined,
          licao_id: licao.licao_id,
        });
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
      await this.professorService.deleteLicao(licaoId);
      await this.loadItens();
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err, 'Erro ao excluir lição.'));
    }
  }

  // --- Adicionar Conteúdo (a uma lição existente) ---

  async adicionarConteudo() {
    this.conteudoError.set(null);

    if (this.conteudoLicaoId === null) {
      this.conteudoError.set('Selecione a lição.');
      return;
    }

    if (this.conteudoLimiteAtingido(this.conteudoLicaoId)) {
      this.conteudoError.set(`Essa lição já atingiu o limite de ${this.maxItensPorLicao} conteúdos.`);
      return;
    }

    const hasText = this.conteudoTexto.trim().length > 0;
    const hasMedia = this.conteudoMidiaType !== 'Texto' && this.conteudoUrl.trim().length > 0;

    if (!hasText && !hasMedia) {
      this.conteudoError.set('Preencha o texto e/ou a URL da mídia.');
      return;
    }

    if (this.conteudoMidiaType !== 'Texto' && !this.conteudoUrl.trim()) {
      this.conteudoError.set('URL da mídia é obrigatória.');
      return;
    }

    try {
      this.savingConteudo.set(true);
      const licao = this.licoes().find(l => l.licao_id === this.conteudoLicaoId);

      await this.professorService.createConteudo({
        nome_conteudo: `Conteúdo da Lição: ${licao?.titulo_licao || ''}`,
        tipo_conteudo: this.conteudoMidiaType,
        url_conteudo: this.conteudoMidiaType !== 'Texto' ? this.conteudoUrl.trim() : undefined,
        texto_conteudo: hasText ? this.conteudoTexto.trim() : undefined,
        licao_id: this.conteudoLicaoId,
      });

      this.showConteudoForm.set(false);
      await this.loadItens();
    } catch (err: unknown) {
      this.conteudoError.set(getErrorMessage(err, 'Erro ao adicionar conteúdo.'));
    } finally {
      this.savingConteudo.set(false);
    }
  }

  async deleteConteudo(conteudoId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Deseja realmente excluir este conteúdo?')) return;
    try {
      await this.professorService.deleteConteudo(conteudoId);
      await this.loadItens();
    } catch (err: unknown) {
      this.conteudoError.set(getErrorMessage(err, 'Erro ao excluir conteúdo.'));
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

    const payloads: { enunciado: string; tipo: TipoQuestao; opcoes?: OpcaoAtividade[]; pares?: ParAssociacao[] }[] = [];

    for (let i = 0; i < this.atividadeQuestoes.length; i++) {
      const questao = this.atividadeQuestoes[i];
      const resultado = this.validarQuestao(questao, i);
      if (resultado === null) return;

      if (questao.tipo === 'multipla_escolha') {
        payloads.push({ enunciado: questao.enunciado.trim(), tipo: questao.tipo, opcoes: resultado as OpcaoAtividade[] });
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
}