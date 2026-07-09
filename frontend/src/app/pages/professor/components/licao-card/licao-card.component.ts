import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProfessorService } from '../../../../services/professor.service';
import { Licao, Conteudo, Atividade } from '../../../../model/professor.models';
import { AtividadesProfessorComponent } from '../atividades-professor/atividades-professor.component';

@Component({
  selector: 'app-licao-card',
  standalone: true,
  imports: [CommonModule, FormsModule, AtividadesProfessorComponent],
  templateUrl: './licao-card.component.html',
  styleUrl: './licao-card.component.css'
})
export class LicaoCardComponent {
  @Input() licao!: Licao;
  private _conteudosRaw: Conteudo[] = [];
  safeConteudos = signal<(Conteudo & { safeUrl?: SafeResourceUrl | null })[]>([]);

  @Input() set conteudos(value: Conteudo[]) {
    this._conteudosRaw = value;
    const mapped = value.map(c => {
      if (c.url_conteudo) {
        return { ...c, safeUrl: this.getSafeYouTubeUrl(c.url_conteudo) };
      }
      return c;
    });
    this.safeConteudos.set(mapped);
  }

  get conteudos(): Conteudo[] {
    return this._conteudosRaw;
  }

  @Input() atividades: Atividade[] = [];
  @Output() licaoAlterada = new EventEmitter<void>();

  private professorService = inject(ProfessorService);
  private sanitizer = inject(DomSanitizer);

  saving = signal<boolean>(false);
  actionError = signal<string | null>(null);

  showAddContentForm = signal<boolean>(false);
  addContentTexto = '';
  addContentUrl = '';
  addContentMidiaType = 'Texto';

  activeEditContentId = signal<number | null>(null);
  editContentTexto = '';
  editContentUrl = '';
  editContentMidiaType = 'Texto';

  getSafeYouTubeUrl(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${match[2]}`);
    }
    return null;
  }

  trackByConteudo(index: number, item: Conteudo) {
    return item.conteudo_id;
  }

  toggleAddContentForm() {
    this.showAddContentForm.update(val => !val);
    if (this.showAddContentForm()) {
      this.addContentTexto = '';
      this.addContentUrl = '';
      this.addContentMidiaType = 'Texto';
      this.actionError.set(null);
    }
  }

  async addConteudo() {
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
      await this.professorService.createConteudo({
        nome_conteudo: `Conteúdo da Lição: ${this.licao.titulo_licao}`,
        tipo_conteudo: this.addContentMidiaType,
        url_conteudo: this.addContentMidiaType !== 'Texto' ? this.addContentUrl.trim() : undefined,
        texto_conteudo: hasText ? this.addContentTexto.trim() : undefined,
        licao_id: this.licao.licao_id
      });

      this.showAddContentForm.set(false);
      this.licaoAlterada.emit();
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
    this.actionError.set(null);
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
      this.licaoAlterada.emit();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao atualizar conteúdo.');
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
      this.licaoAlterada.emit();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao excluir conteúdo.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteLicao() {
    if (!confirm('Tem certeza que deseja excluir esta lição? Todos os conteúdos e atividades associados serão apagados.')) {
      return;
    }

    this.actionError.set(null);
    try {
      this.saving.set(true);

      for (const content of this.conteudos) {
        await this.professorService.deleteConteudo(content.conteudo_id);
      }

      for (const atividade of this.atividades) {
        await this.professorService.deleteAtividade(atividade.atividade_id);
      }

      await this.professorService.deleteLicao(this.licao.licao_id);
      this.licaoAlterada.emit();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao excluir lição.');
    } finally {
      this.saving.set(false);
    }
  }

  onAtividadeAlterada() {
    this.licaoAlterada.emit();
  }
}
