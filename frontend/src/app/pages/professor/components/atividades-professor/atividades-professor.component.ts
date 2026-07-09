import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService } from '../../../../services/professor.service';
import { Atividade, OpcaoAtividade, ParAssociacao } from '../../../../model/professor.models';

type OpcaoId = 'a' | 'b' | 'c' | 'd';

interface AtividadeFormOpcoes {
  a: string;
  b: string;
  c: string;
  d: string;
}

@Component({
  selector: 'app-atividades-professor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atividades-professor.component.html',
  styleUrl: './atividades-professor.component.css',
})
export class AtividadesProfessorComponent {
  @Input() licaoId!: number;
  @Input() atividades: Atividade[] = [];
  @Output() atividadeAlterada = new EventEmitter<void>();

  private professorService = inject(ProfessorService);

  readonly opcaoIds: OpcaoId[] = ['a', 'b', 'c', 'd'];
  readonly opcaoLabels = ['A', 'B', 'C', 'D'];

  saving = signal<boolean>(false);
  actionError = signal<string | null>(null);

  showAddForm = signal<boolean>(false);
  addAtividadeTitulo = '';
  addAtividadeTipo: string = 'multipla_escolha';
  addAtividadeEnunciado = '';
  addAtividadeOpcoes: AtividadeFormOpcoes = { a: '', b: '', c: '', d: '' };
  addAtividadeRespostaCorreta: OpcaoId = 'a';
  addAtividadePares: ParAssociacao[] = [];

  activeEditAtividadeId = signal<number | null>(null);
  editAtividadeTitulo = '';
  editAtividadeTipo: string = 'multipla_escolha';
  editAtividadeEnunciado = '';
  editAtividadeOpcoes: AtividadeFormOpcoes = { a: '', b: '', c: '', d: '' };
  editAtividadeRespostaCorreta: OpcaoId = 'a';
  editAtividadePares: ParAssociacao[] = [];

  private emptyAtividadeOpcoes(): AtividadeFormOpcoes {
    return { a: '', b: '', c: '', d: '' };
  }

  private buildOpcoesFromForm(
    opcoes: AtividadeFormOpcoes,
    respostaCorreta: OpcaoId,
  ): OpcaoAtividade[] | null {
    const opcoesPreenchidas = this.opcaoIds
      .filter(id => opcoes[id].trim().length > 0)
      .map(id => ({
        letra: id,
        texto_opcao: opcoes[id].trim(),
        correta: id === respostaCorreta
      }));

    if (opcoesPreenchidas.length < 2) {
      this.actionError.set('Preencha pelo menos 2 opções de resposta.');
      return null;
    }

    if (!opcoesPreenchidas.some(o => o.letra === respostaCorreta)) {
      this.actionError.set('A resposta correta deve ser uma das opções preenchidas.');
      return null;
    }

    return opcoesPreenchidas;
  }

  private fillFormFromAtividade(atividade: Atividade): {
    enunciado: string;
    opcoes: AtividadeFormOpcoes;
    respostaCorreta: OpcaoId;
  } {
    const opcoes = this.emptyAtividadeOpcoes();
    let respostaCorreta: OpcaoId = 'a';

    atividade.opcoes?.forEach(opcao => {
      opcoes[opcao.letra] = opcao.texto_opcao;
      if (opcao.correta) {
        respostaCorreta = opcao.letra;
      }
    });

    return {
      enunciado: atividade.enunciado || '',
      opcoes,
      respostaCorreta,
    };
  }

  getTipoAtividadeLabel(tipo: string): string {
    if (tipo === 'multipla_escolha') return 'Múltipla Escolha';
    if (tipo === 'associacao_imagens') return 'Associação de Imagens';
    return tipo;
  }

  toggleAddAtividadeForm() {
    this.showAddForm.update(val => !val);
    if (this.showAddForm()) {
      this.addAtividadeTitulo = '';
      this.addAtividadeTipo = 'multipla_escolha';
      this.addAtividadeEnunciado = '';
      this.addAtividadeOpcoes = this.emptyAtividadeOpcoes();
      this.addAtividadeRespostaCorreta = 'a';
      this.addAtividadePares = [];
      this.actionError.set(null);
    }
  }

  addParToAddForm() {
    this.addAtividadePares.push({
      esquerdo: { tipo: 'texto', texto: '', imagem_url: '' },
      direito: { tipo: 'texto', texto: '', imagem_url: '' },
    });
  }

  removeParFromAddForm(index: number) {
    this.addAtividadePares.splice(index, 1);
  }

  addParToEditForm() {
    this.editAtividadePares.push({
      esquerdo: { tipo: 'texto', texto: '', imagem_url: '' },
      direito: { tipo: 'texto', texto: '', imagem_url: '' },
    });
  }

  removeParFromEditForm(index: number) {
    this.editAtividadePares.splice(index, 1);
  }

  async addAtividade() {
    this.actionError.set(null);

    if (!this.addAtividadeTitulo.trim()) {
      this.actionError.set('O título da atividade é obrigatório.');
      return;
    }

    if (!this.addAtividadeEnunciado.trim()) {
      this.actionError.set('O enunciado da atividade é obrigatório.');
      return;
    }

    let opcoes: OpcaoAtividade[] | undefined = undefined;
    let pares_associacao: ParAssociacao[] | undefined = undefined;

    if (this.addAtividadeTipo === 'multipla_escolha') {
      const result = this.buildOpcoesFromForm(
        this.addAtividadeOpcoes,
        this.addAtividadeRespostaCorreta,
      );
      if (!result) return;
      opcoes = result;
    } else if (this.addAtividadeTipo === 'associacao_imagens') {
      if (this.addAtividadePares.length < 2) {
        this.actionError.set('A associação de imagens deve ter pelo menos 2 pares.');
        return;
      }
      for (const p of this.addAtividadePares) {
        if (p.esquerdo.tipo === 'texto' && !p.esquerdo.texto?.trim()) {
          this.actionError.set('Preencha o campo de texto do item esquerdo.');
          return;
        }
        if (p.esquerdo.tipo === 'imagem' && !p.esquerdo.imagem_url?.trim()) {
          this.actionError.set('Preencha a URL da imagem do item esquerdo.');
          return;
        }
        if (p.direito.tipo === 'texto' && !p.direito.texto?.trim()) {
          this.actionError.set('Preencha o campo de texto do item direito.');
          return;
        }
        if (p.direito.tipo === 'imagem' && !p.direito.imagem_url?.trim()) {
          this.actionError.set('Preencha a URL da imagem do item direito.');
          return;
        }
      }
      pares_associacao = this.addAtividadePares;
    }

    try {
      this.saving.set(true);
      await this.professorService.createAtividade({
        titulo_atividade: this.addAtividadeTitulo.trim(),
        tipo_atividade: this.addAtividadeTipo,
        enunciado: this.addAtividadeEnunciado.trim(),
        opcoes: opcoes,
        pares_associacao: pares_associacao,
        licao_id: this.licaoId,
      });

      this.showAddForm.set(false);
      this.atividadeAlterada.emit();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao adicionar atividade.');
    } finally {
      this.saving.set(false);
    }
  }

  startEditAtividade(atividade: Atividade) {
    this.activeEditAtividadeId.set(atividade.atividade_id);
    this.editAtividadeTitulo = atividade.titulo_atividade;
    this.editAtividadeTipo = atividade.tipo_atividade;

    const form = this.fillFormFromAtividade(atividade);
    this.editAtividadeEnunciado = form.enunciado;
    this.editAtividadeOpcoes = form.opcoes;
    this.editAtividadeRespostaCorreta = form.respostaCorreta;

    this.editAtividadePares = [];
    if (atividade.relacoes_corretas && atividade.itens_esquerdos && atividade.itens_direitos) {
      for (const rel of atividade.relacoes_corretas) {
        const esq = atividade.itens_esquerdos.find(i => i.item_associacao_id === rel.item_1_id);
        const dir = atividade.itens_direitos.find(i => i.item_associacao_id === rel.item_2_id);
        if (esq && dir) {
          this.editAtividadePares.push({
            esquerdo: { tipo: esq.tipo, texto: esq.texto || '', imagem_url: esq.imagem_url || '' },
            direito: { tipo: dir.tipo, texto: dir.texto || '', imagem_url: dir.imagem_url || '' },
          });
        }
      }
    }
  }

  cancelEditAtividade() {
    this.activeEditAtividadeId.set(null);
    this.actionError.set(null);
  }

  async saveEditAtividade(atividadeId: number) {
    this.actionError.set(null);

    if (!this.editAtividadeTitulo.trim()) {
      this.actionError.set('O título da atividade é obrigatório.');
      return;
    }

    if (!this.editAtividadeEnunciado.trim()) {
      this.actionError.set('O enunciado da atividade é obrigatório.');
      return;
    }

    let opcoes: OpcaoAtividade[] | undefined = undefined;
    let pares_associacao: ParAssociacao[] | undefined = undefined;

    if (this.editAtividadeTipo === 'multipla_escolha') {
      const result = this.buildOpcoesFromForm(
        this.editAtividadeOpcoes,
        this.editAtividadeRespostaCorreta,
      );
      if (!result) return;
      opcoes = result;
    } else if (this.editAtividadeTipo === 'associacao_imagens') {
      if (this.editAtividadePares.length < 2) {
        this.actionError.set('A associação de imagens deve ter pelo menos 2 pares.');
        return;
      }
      for (const p of this.editAtividadePares) {
        if (p.esquerdo.tipo === 'texto' && !p.esquerdo.texto?.trim()) {
          this.actionError.set('Preencha o campo de texto do item esquerdo.');
          return;
        }
        if (p.esquerdo.tipo === 'imagem' && !p.esquerdo.imagem_url?.trim()) {
          this.actionError.set('Preencha a URL da imagem do item esquerdo.');
          return;
        }
        if (p.direito.tipo === 'texto' && !p.direito.texto?.trim()) {
          this.actionError.set('Preencha o campo de texto do item direito.');
          return;
        }
        if (p.direito.tipo === 'imagem' && !p.direito.imagem_url?.trim()) {
          this.actionError.set('Preencha a URL da imagem do item direito.');
          return;
        }
      }
      pares_associacao = this.editAtividadePares;
    }

    try {
      this.saving.set(true);
      await this.professorService.updateAtividade(atividadeId, {
        titulo_atividade: this.editAtividadeTitulo.trim(),
        tipo_atividade: this.editAtividadeTipo,
        enunciado: this.editAtividadeEnunciado.trim(),
        opcoes: opcoes,
        pares_associacao: pares_associacao,
      });

      this.activeEditAtividadeId.set(null);
      this.atividadeAlterada.emit();
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
      this.atividadeAlterada.emit();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao excluir atividade.');
    } finally {
      this.saving.set(false);
    }
  }
}
