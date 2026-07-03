import { Component, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adm.component.html',
  styleUrl: './adm.component.css'
})
export class AdmComponent implements OnInit {
  userName = signal('Administrador');
  pendingProfessors = signal<any[]>([]);
  loading = signal<boolean>(false);
  actionError = signal<string | null>(null);

  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
    this.loadPendingProfessors();
  }

  async loadPendingProfessors() {
    this.loading.set(true);
    try {
      const users = await this.userService.getUsers();
      const pending = users.filter(user => 
        user.permissions.includes('PROFESSOR') && !user.approved
      );
      this.pendingProfessors.set(pending);
    } catch (err: any) {
      console.error('Erro ao buscar professores pendentes', err);
    } finally {
      this.loading.set(false);
    }
  }

  async approveProfessor(id: number) {
    this.actionError.set(null);
    try {
      await this.userService.approveUser(id);
      this.pendingProfessors.update(profs => profs.filter(p => p.id !== id));
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao aprovar professor');
    }
  }

  async rejectProfessor(id: number) {
    this.actionError.set(null);
    try {
      await this.userService.rejectUser(id);
      this.pendingProfessors.update(profs => profs.filter(p => p.id !== id));
    } catch (err: any) {
      this.actionError.set(err.message || 'Erro ao rejeitar professor');
    }
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/auth']);
  }
}
