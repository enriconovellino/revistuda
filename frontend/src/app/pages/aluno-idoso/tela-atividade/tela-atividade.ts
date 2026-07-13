import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AlunoService } from '../../../services/aluno.service';
import { AtividadeService } from '../../../services/atividade.service';
import { LicaoService } from '../../../services/licao.service';
import { ConteudoService } from '../../../services/conteudo.service';
import { Atividade, OpcaoAtividade, ItemAssociacao } from '../../../model/atividade.model';
import { environment } from '../../../../environments/environment';

type ResultadoAtividade = 'acerto' | 'erro' | null;

@Component({
  selector: 'app-tela-atividade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tela-atividade.html',
  styleUrl: './tela-atividade.css',
})
export class TelaAtividade implements OnInit {
  atividade = signal<Atividade | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  // Múltipla escolha
  opcaoSelecionadaId = signal<number | null>(null);

  // Associação de imagens
  selectedLeftId = signal<number | null>(null);
  conexoes = signal<Map<number, number>>(new Map()); // item_esquerdo_id -> item_direito_id

  respostaEnviada = signal(false);
  resultado = signal<ResultadoAtividade>(null);
  proximaAtividadeId = signal<number | null>(null);
  /** { moduloId, licaoIndex } da próxima lição não concluída no módulo */
  proximaLicaoNav = signal<{ moduloId: number; licaoIndex: number } | null>(null);

  opcoesOrdenadas = computed(() => {
    const opcoes = this.atividade()?.opcoes ?? [];
    return [...opcoes].sort((a, b) => a.letra.localeCompare(b.letra));
  });

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);
  private atividadeService = inject(AtividadeService);
  private licaoService = inject(LicaoService);
  private conteudoService = inject(ConteudoService);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.carregarAtividade(Number(id));
        } else {
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
    }
  }

  async carregarAtividade(id: number) {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.resetarResposta();

    try {
      const atividade = await this.atividadeService.getAtividadeById(id);
      if (!atividade) {
        this.hasError.set(true);
        return;
      }

      // Bloqueia atividade já concluída
      if (atividade.status === 'feito') {
        this.router.navigate(['/aluno-idoso/atividades']);
        return;
      }

      // Marca como "fazendo" no banco (ignora erro caso já esteja nesse estado)
      await this.alunoService.iniciarAtividade(id).catch(() => null);

      this.atividade.set(atividade);
    } catch {
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- Mapeamento de cliques para Múltipla Escolha ---
  selecionarOpcao(opcao: OpcaoAtividade) {
    if (this.respostaEnviada()) return;
    this.opcaoSelecionadaId.set(opcao.opcao_id ?? null);
  }

  // --- Mapeamento de cliques para Associação de Imagens ---
  selecionarEsquerdo(id: number) {
    if (this.respostaEnviada()) return;
    if (this.isItemEsquerdoConectado(id)) {
      this.desconectar(id);
      return;
    }
    if (this.selectedLeftId() === id) {
      this.selectedLeftId.set(null);
    } else {
      this.selectedLeftId.set(id);
    }
  }

  conectarDireito(id: number) {
    if (this.respostaEnviada()) return;

    // Se o item direito já está conectado, clicar nele desfaz a conexão correspondente
    if (this.isItemDireitoConectado(id)) {
      for (const [leftId, rightId] of this.conexoes().entries()) {
        if (rightId === id) {
          this.desconectar(leftId);
          break;
        }
      }
      return;
    }

    const leftId = this.selectedLeftId();
    if (leftId === null) return;

    const map = new Map(this.conexoes());
    map.delete(leftId);

    // Remove qualquer conexão anterior que já use o mesmo item direito (relacionamento 1-para-1)
    for (const [k, v] of map.entries()) {
      if (v === id) {
        map.delete(k);
      }
    }

    map.set(leftId, id);
    this.conexoes.set(map);
    this.selectedLeftId.set(null);
  }

  desconectar(leftId: number) {
    if (this.respostaEnviada()) return;
    const map = new Map(this.conexoes());
    map.delete(leftId);
    this.conexoes.set(map);
  }

  isLeftItemSelected(id: number): boolean {
    return this.selectedLeftId() === id;
  }

  isItemEsquerdoConectado(id: number): boolean {
    return this.conexoes().has(id);
  }

  isItemDireitoConectado(id: number): boolean {
    for (const v of this.conexoes().values()) {
      if (v === id) return true;
    }
    return false;
  }

  getParBadge(leftId: number): string {
    const leftItens = this.atividade()?.itens_esquerdos ?? [];
    const index = leftItens.findIndex(item => item.item_associacao_id === leftId);
    return index >= 0 ? `Par ${index + 1}` : '';
  }

  obterParBadgeDoItemDireito(rightId: number): string {
    for (const [leftId, rId] of this.conexoes().entries()) {
      if (rId === rightId) {
        return this.getParBadge(leftId);
      }
    }
    return '';
  }

  isConexaoCorreta(leftId: number): boolean {
    const rightId = this.conexoes().get(leftId);
    if (rightId === undefined) return false;
    const relacoes = this.atividade()?.relacoes_corretas ?? [];
    return relacoes.some(r => r.item_1_id === leftId && r.item_2_id === rightId);
  }

  isConexaoIncorreta(leftId: number): boolean {
    if (!this.respostaEnviada()) return false;
    return this.conexoes().has(leftId) && !this.isConexaoCorreta(leftId);
  }

  obterItemDireitoCorreto(leftId: number): ItemAssociacao | undefined {
    const rel = this.atividade()?.relacoes_corretas?.find(r => r.item_1_id === leftId);
    if (!rel) return undefined;
    return this.atividade()?.itens_direitos?.find(i => i.item_associacao_id === rel.item_2_id);
  }

  // --- Submissão de Resposta ---
  async enviarResposta() {
    const atividade = this.atividade();
    if (!atividade) return;

    if (atividade.tipo_atividade === 'multipla_escolha') {
      const selecionadaId = this.opcaoSelecionadaId();
      if (selecionadaId === null) return;

      const opcaoEscolhida = atividade.opcoes?.find(o => o.opcao_id === selecionadaId);
      if (!opcaoEscolhida) return;

      this.respostaEnviada.set(true);
      this.resultado.set(opcaoEscolhida.correta ? 'acerto' : 'erro');

      try {
        await this.atividadeService.responderAtividadeMultiplaEscolha(atividade.atividade_id, selecionadaId);
      } catch (error) {
        console.error('Erro ao salvar resposta no banco:', error);
      }

      await this.buscarProximaAtividade(atividade.licao_id, atividade.atividade_id);
    } else if (atividade.tipo_atividade === 'associacao_imagens') {
      const leftItens = atividade.itens_esquerdos ?? [];
      if (this.conexoes().size < leftItens.length) return; // Precisa preencher tudo

      const relacoes = atividade.relacoes_corretas ?? [];
      let totalCorretas = 0;
      const respostasFormatadas: { item_1_id: number; item_2_id: number }[] = [];

      for (const [leftId, rightId] of this.conexoes().entries()) {
        respostasFormatadas.push({ item_1_id: leftId, item_2_id: rightId });
        const correta = relacoes.some(r => r.item_1_id === leftId && r.item_2_id === rightId);
        if (correta) {
          totalCorretas++;
        }
      }

      const acertoCompleto = totalCorretas === relacoes.length;
      this.respostaEnviada.set(true);
      this.resultado.set(acertoCompleto ? 'acerto' : 'erro');

      try {
        await this.atividadeService.responderAtividadeAssociacao(atividade.atividade_id, respostasFormatadas);
      } catch (error) {
        console.error('Erro ao salvar resposta de associção no banco:', error);
      }

      await this.buscarProximaAtividade(atividade.licao_id, atividade.atividade_id);
    }
  }

  private async buscarProximaAtividade(licaoId: number, atividadeAtualId: number): Promise<void> {
    try {
      const todas = await this.atividadeService.getAtividades();
      const proxima = todas.find(
        a =>
          a.licao_id === licaoId &&
          a.atividade_id !== atividadeAtualId &&
          (a.status === 'a_fazer' || a.status === 'fazendo')
      );
      this.proximaAtividadeId.set(proxima?.atividade_id ?? null);

      // Se não há mais atividades nessa lição, busca a próxima lição
      if (!proxima) {
        const licaoAtual = todas.find(a => a.licao_id === licaoId);
        const moduloId = licaoAtual?.modulo?.modulo_id;
        if (moduloId) {
          await this.buscarProximaLicao(licaoId, moduloId);
        }
      } else {
        this.proximaLicaoNav.set(null);
      }
    } catch {
      this.proximaAtividadeId.set(null);
      this.proximaLicaoNav.set(null);
    }
  }

  private async buscarProximaLicao(licaoAtualId: number, moduloId: number): Promise<void> {
    try {
      const [todasLicoes, todosConteudos, concluidosIds] = await Promise.all([
        this.licaoService.getLicoes(),
        this.conteudoService.getConteudos(),
        this.conteudoService.getProgressoConteudos(moduloId),
      ]);

      const licoesDoModulo = todasLicoes.filter(l => l.modulo_id === moduloId);
      const indexAtual = licoesDoModulo.findIndex(l => l.licao_id === licaoAtualId);

      // Percorre as lições seguintes no mesmo módulo
      for (let i = indexAtual + 1; i < licoesDoModulo.length; i++) {
        const licao = licoesDoModulo[i];
        const conteudosDaLicao = todosConteudos.filter(c => c.licao_id === licao.licao_id);
        const todaConcluida =
          conteudosDaLicao.length > 0 &&
          conteudosDaLicao.every(c => concluidosIds.includes(c.conteudo_id));

        if (!todaConcluida) {
          this.proximaLicaoNav.set({ moduloId, licaoIndex: i });
          return;
        }
      }
      // Todas as lições subsequentes já concluídas (ou não há mais)
      this.proximaLicaoNav.set(null);
    } catch {
      this.proximaLicaoNav.set(null);
    }
  }

  irParaProximaAtividade(): void {
    const id = this.proximaAtividadeId();
    if (id !== null) {
      this.router.navigate(['/aluno-idoso/atividade', id]);
    }
  }

  irParaProximaLicao(): void {
    const nav = this.proximaLicaoNav();
    if (nav) {
      this.router.navigate(['/aluno-idoso/modulo', nav.moduloId], {
        queryParams: { licao: nav.licaoIndex }
      });
    }
  }

  voltarParaAtividades() {
    this.router.navigate(['/aluno-idoso/atividades']);
  }

  voltarParaCursos() {
    this.router.navigate(['/aluno-idoso/modulos']);
  }


  getLetraLabel(letra: string): string {
    return letra.toUpperCase();
  }

  getTipoAtividadeLabel(tipo: string): string {
    const map: Record<string, string> = {
      'multipla_escolha': 'Múltipla Escolha',
      'associacao_imagens': 'Associação de Imagens'
    };
    return map[tipo] ?? tipo;
  }

  isOpcaoCorreta(opcao: OpcaoAtividade): boolean {
    return this.respostaEnviada() && opcao.correta;
  }

  isOpcaoErrada(opcao: OpcaoAtividade): boolean {
    return (
      this.respostaEnviada() &&
      this.resultado() === 'erro' &&
      opcao.opcao_id === this.opcaoSelecionadaId()
    );
  }

  isOpcaoSelecionada(opcao: OpcaoAtividade): boolean {
    return opcao.opcao_id === this.opcaoSelecionadaId();
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  private resetarResposta() {
    this.opcaoSelecionadaId.set(null);
    this.selectedLeftId.set(null);
    this.conexoes.set(new Map());
    this.respostaEnviada.set(false);
    this.resultado.set(null);
  }
}
