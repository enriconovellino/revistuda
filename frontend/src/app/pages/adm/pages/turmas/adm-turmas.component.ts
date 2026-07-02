import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurmasService, Turma, TurmaPayload } from '../../../../services/turmas.service';

@Component({
  selector: 'app-adm-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm-turmas.component.html',
  styleUrl: './adm-turmas.component.css',
})
export class AdmTurmasComponent implements OnInit {
  turmas = signal<Turma[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  modalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingId = signal<number | null>(null);
  deleteConfirmId = signal<number | null>(null);

  form: TurmaPayload = { nome_turma: '', descricao_turma: '', capacidade_maxima: undefined };

  constructor(private turmasService: TurmasService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.turmas.set(await this.turmasService.getAll());
    } catch {
      this.error.set('Erro ao carregar turmas.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal() {
    this.form = { nome_turma: '', descricao_turma: '', capacidade_maxima: undefined };
    this.modalMode.set('create');
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(t: Turma) {
    this.form = { nome_turma: t.nome_turma, descricao_turma: t.descricao_turma ?? '', capacidade_maxima: t.capacidade_maxima };
    this.editingId.set(t.turma_id);
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
      const payload: TurmaPayload = {
        nome_turma: this.form.nome_turma,
        descricao_turma: this.form.descricao_turma || undefined,
        capacidade_maxima: this.form.capacidade_maxima ? Number(this.form.capacidade_maxima) : undefined,
      };
      if (this.modalMode() === 'create') {
        await this.turmasService.create(payload);
      } else {
        await this.turmasService.update(this.editingId()!, payload);
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
      await this.turmasService.delete(id);
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
