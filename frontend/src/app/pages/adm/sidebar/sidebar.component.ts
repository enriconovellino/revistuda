import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AdmView } from '../adm.component';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarAdminComponent {
  @Input({ required: true }) currentView!: AdmView;
  @Output() currentViewChange = new EventEmitter<AdmView>();

  private router = inject(Router);

  setView(view: AdmView) {
    this.currentViewChange.emit(view);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }
}
