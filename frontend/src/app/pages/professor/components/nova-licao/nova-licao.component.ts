import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService } from '../../../../services/professor.service';

@Component({
  selector: 'app-nova-licao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-licao.component.html',
  styleUrl: './nova-licao.component.css'
})
export class NovaLicaoComponent {
  @Input() moduloId!: number;
  @Output() licaoCriada = new EventEmitter<void>();

  private professorService = inject(ProfessorService);

  saving = signal<boolean>(false);
  actionError = signal<string | null>(null);

  newLicaoTitulo = '';
  newLicaoComentario = '';
  newLicaoTexto = '';
  newLicaoUrl = '';
  newLicaoMidiaType = 'Texto';

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

      this.licaoCriada.emit();
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao criar lição.');
    } finally {
      this.saving.set(false);
    }
  }
}
