import { Component, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarAdminComponent implements OnInit {
  @Output() collapsedChange = new EventEmitter<boolean>();

  private router = inject(Router);

  isLogoutModalOpen = signal<boolean>(false);
  collapsed = signal<boolean>(false);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.collapsed.set(localStorage.getItem('sidebarCollapsed') === 'true');
      this.collapsedChange.emit(this.collapsed());
    }
  }

  toggleCollapse() {
    this.collapsed.set(!this.collapsed());
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('sidebarCollapsed', String(this.collapsed()));
    }
    this.collapsedChange.emit(this.collapsed());
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
