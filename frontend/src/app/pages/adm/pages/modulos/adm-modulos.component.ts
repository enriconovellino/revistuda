import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulosService, Modulo, ModuloPayload } from '../../../../services/modulos.service';

@Component({
  selector: 'app-adm-modulos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm-modulos.component.html',
  styleUrl: './adm-modulos.component.css',
})
export class AdmModulosComponent implements OnInit {
  modulos = signal<Modulo[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  modalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingId = signal<number | null>(null);
  deleteConfirmId = signal<number | null>(null);

  readonly DIFICULDADES = ['Fácil', 'Médio', 'Difícil'];

  form: ModuloPayload = { titulo_modulo: '', descricao_modulo: '', dificuldade: 'Fácil' };

  constructor(private modulosService: ModulosService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.modulos.set(await this.modulosService.getAll());
    } catch {
      this.error.set('Erro ao carregar módulos.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal() {
    this.form = { titulo_modulo: '', descricao_modulo: '', dificuldade: 'Fácil' };
    this.modalMode.set('create');
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(m: Modulo) {
    this.form = { titulo_modulo: m.titulo_modulo, descricao_modulo: m.descricao_id ?? '', dificuldade: m.dificuldade };
    this.editingId.set(m.modulo_id);
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
      const payload: ModuloPayload = {
        titulo_modulo: this.form.titulo_modulo,
        descricao_modulo: this.form.descricao_modulo || undefined,
        dificuldade: this.form.dificuldade,
      };
      if (this.modalMode() === 'create') {
        await this.modulosService.create(payload);
      } else {
        await this.modulosService.update(this.editingId()!, payload);
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
      await this.modulosService.delete(id);
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
