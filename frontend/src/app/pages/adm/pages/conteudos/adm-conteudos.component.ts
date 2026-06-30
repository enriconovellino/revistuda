import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConteudosService, Conteudo, ConteudoPayload } from '../../../../services/conteudos.service';

@Component({
  selector: 'app-adm-conteudos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm-conteudos.component.html',
  styleUrl: './adm-conteudos.component.css',
})
export class AdmConteudosComponent implements OnInit {
  conteudos = signal<Conteudo[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  modalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingId = signal<number | null>(null);
  deleteConfirmId = signal<number | null>(null);

  readonly TIPOS = ['Vídeo', 'Áudio', 'Texto'];

  form: ConteudoPayload = { nome_conteudo: '', tipo_conteudo: 'Texto', video_url: '', audio_link: '', texto_conteudo: '' };

  constructor(private conteudosService: ConteudosService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.conteudos.set(await this.conteudosService.getAll());
    } catch {
      this.error.set('Erro ao carregar conteúdos.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal() {
    this.form = { nome_conteudo: '', tipo_conteudo: 'Texto', video_url: '', audio_link: '', texto_conteudo: '' };
    this.modalMode.set('create');
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(c: Conteudo) {
    this.form = {
      nome_conteudo: c.nome_conteudo,
      tipo_conteudo: c.tipo_conteudo,
      video_url: c.video_url ?? '',
      audio_link: c.audio_link ?? '',
      texto_conteudo: c.texto_conteudo ?? '',
    };
    this.editingId.set(c.conteudo_id);
    this.modalMode.set('edit');
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.error.set(null);
  }

  async save() {
    this.saving.set(true);
    this.error.set(null);
    try {
      const payload: ConteudoPayload = {
        nome_conteudo: this.form.nome_conteudo,
        tipo_conteudo: this.form.tipo_conteudo,
        video_url: this.form.video_url || undefined,
        audio_link: this.form.audio_link || undefined,
        texto_conteudo: this.form.texto_conteudo || undefined,
      };
      if (this.modalMode() === 'create') {
        await this.conteudosService.create(payload);
      } else {
        await this.conteudosService.update(this.editingId()!, payload);
      }
      this.closeModal();
      await this.load();
    } catch (e: any) {
      this.error.set(this.parseError(e));
    } finally {
      this.saving.set(false);
    }
  }

  confirmDelete(id: number) { this.deleteConfirmId.set(id); }
  cancelDelete() { this.deleteConfirmId.set(null); }

  async executeDelete() {
    const id = this.deleteConfirmId();
    if (!id) return;
    try {
      await this.conteudosService.delete(id);
      this.deleteConfirmId.set(null);
      await this.load();
    } catch (e: any) {
      this.error.set(this.parseError(e));
    }
  }

  private parseError(e: any): string {
    try {
      const p = JSON.parse(e.message);
      return Array.isArray(p?.message) ? p.message[0] : (p?.message ?? 'Erro desconhecido');
    } catch {
      return e.message ?? 'Erro desconhecido';
    }
  }
}
