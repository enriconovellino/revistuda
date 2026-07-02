import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../../../services/users.service';
import { ROLE_PERMISSIONS, ROLE_LABELS, ALL_ROLES, detectRole, AppRole } from '../../../../shared/constants/roles';

@Component({
  selector: 'app-adm-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm-users.component.html',
  styleUrl: './adm-users.component.css',
})
export class AdmUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  modalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingId = signal<number | null>(null);
  deleteConfirmId = signal<number | null>(null);

  readonly ROLE_LABELS = ROLE_LABELS;
  readonly ALL_ROLES = ALL_ROLES;

  createForm = { nome: '', email: '', senha: '', permission: 'PROFESSOR' };
  editForm = { nome: '', email: '', permission: 'PROFESSOR' };

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const users = await this.usersService.getAll();
      this.users.set(users);
    } catch {
      this.error.set('Erro ao carregar usuários. Verifique a conexão.');
    } finally {
      this.loading.set(false);
    }
  }

  getRoleLabel(permissions: string[]): string {
    const role = detectRole(permissions);
    return role ? ROLE_LABELS[role] : '—';
  }

  openCreateModal() {
    this.createForm = { nome: '', email: '', senha: '', permission: 'PROFESSOR' };
    this.modalMode.set('create');
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(user: User) {
    const role = detectRole(user.permissions) ?? 'PROFESSOR';
    this.editForm = { nome: user.nome, email: user.email, permission: role };
    this.editingId.set(user.id);
    this.modalMode.set('edit');
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.error.set(null);
  }

  async saveCreate() {
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.usersService.create(this.createForm);
      this.closeModal();
      await this.loadUsers();
    } catch (e: any) {
      const msg = this.parseError(e);
      this.error.set(msg);
    } finally {
      this.saving.set(false);
    }
  }

  async saveEdit() {
    const id = this.editingId();
    if (!id) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const permissions = ROLE_PERMISSIONS[this.editForm.permission as AppRole] ?? [];
      await this.usersService.update(id, {
        nome: this.editForm.nome,
        email: this.editForm.email,
        permissions,
      });
      this.closeModal();
      await this.loadUsers();
    } catch (e: any) {
      this.error.set(this.parseError(e));
    } finally {
      this.saving.set(false);
    }
  }

  confirmDelete(id: number) {
    this.deleteConfirmId.set(id);
  }

  cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  async executeDelete() {
    const id = this.deleteConfirmId();
    if (!id) return;
    try {
      await this.usersService.delete(id);
      this.deleteConfirmId.set(null);
      await this.loadUsers();
    } catch (e: any) {
      this.error.set(this.parseError(e));
    }
  }

  private parseError(e: any): string {
    try {
      const parsed = JSON.parse(e.message);
      return Array.isArray(parsed?.message) ? parsed.message[0] : (parsed?.message ?? 'Erro desconhecido');
    } catch {
      return e.message ?? 'Erro desconhecido';
    }
  }
}
