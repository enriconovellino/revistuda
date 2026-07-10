import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AlunoService } from '../../services/aluno.service';
import { Atividade, OpcaoAtividade, ItemAssociacao } from '../../model/aluno.model';
import { environment } from '../../../environments/environment';

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
  fontSize = signal(1.2);

  // Múltipla escolha
  opcaoSelecionadaId = signal<number | null>(null);

  // Associação de imagens
  selectedLeftId = signal<number | null>(null);
  conexoes = signal<Map<number, number>>(new Map()); // item_esquerdo_id -> item_direito_id

  respostaEnviada = signal(false);
  resultado = signal<ResultadoAtividade>(null);

  opcoesOrdenadas = computed(() => {
    const opcoes = this.atividade()?.opcoes ?? [];
    return [...opcoes].sort((a, b) => a.letra.localeCompare(b.letra));
  });

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);

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
      const atividade = await this.alunoService.getAtividadeById(id);
      if (!atividade) {
        this.hasError.set(true);
        return;
      }
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
    this.opcaoSelecionadaId.set(opcao.opcao_id);
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
        await this.alunoService.responderAtividadeMultiplaEscolha(atividade.atividade_id, selecionadaId);
      } catch (error) {
        console.error('Erro ao salvar resposta no banco:', error);
      }
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
        await this.alunoService.responderAtividadeAssociacao(atividade.atividade_id, respostasFormatadas);
      } catch (error) {
        console.error('Erro ao salvar resposta de associação no banco:', error);
      }
    }
  }

  tentarNovamente() {
    this.resetarResposta();
  }

  voltarParaAtividades() {
    this.router.navigate(['/aluno-idoso'], { queryParams: { view: 'atividades' } });
  }

  changeFontSize(offset: number) {
    const next = parseFloat((this.fontSize() + offset).toFixed(1));
    if (next >= 0.9 && next <= 2.0) this.fontSize.set(next);
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
