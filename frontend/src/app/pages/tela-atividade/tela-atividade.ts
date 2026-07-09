import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AlunoService } from '../../services/aluno.service';
import { Atividade, OpcaoAtividade } from '../../model/aluno.model';

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

  opcaoSelecionadaId = signal<number | null>(null);
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

  selecionarOpcao(opcao: OpcaoAtividade) {
    if (this.respostaEnviada()) return;
    this.opcaoSelecionadaId.set(opcao.opcao_id);
  }

  async enviarResposta() {
    const atividade = this.atividade();
    const selecionadaId = this.opcaoSelecionadaId();
    if (!atividade || selecionadaId === null) return;

    const opcaoEscolhida = atividade.opcoes?.find(o => o.opcao_id === selecionadaId);
    if (!opcaoEscolhida) return;

    this.respostaEnviada.set(true);
    this.resultado.set(opcaoEscolhida.correta ? 'acerto' : 'erro');

    try {
      await this.alunoService.responderAtividadeMultiplaEscolha(atividade.atividade_id, selecionadaId);
    } catch (error) {
      console.error('Erro ao salvar resposta no banco:', error);
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

  private resetarResposta() {
    this.opcaoSelecionadaId.set(null);
    this.respostaEnviada.set(false);
    this.resultado.set(null);
  }
}
