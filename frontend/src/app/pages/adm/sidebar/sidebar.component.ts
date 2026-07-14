import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AdmView } from '../adm.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarAdminComponent {
  @Input({ required: true }) currentView!: AdmView;
  @Output() currentViewChange = new EventEmitter<AdmView>();

  private router = inject(Router);

  isLogoutModalOpen = signal<boolean>(false);

  setView(view: AdmView) {
    this.currentViewChange.emit(view);
  }

  abrirModalLogout() {
    this.isLogoutModalOpen.set(true);
  }

  cancelarLogout() {
    this.isLogoutModalOpen.set(false);
  }

  logout() {
    this.isLogoutModalOpen.set(false);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
