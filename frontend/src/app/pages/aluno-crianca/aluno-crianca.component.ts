import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aluno-crianca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aluno-crianca.component.html',
  styleUrl: './aluno-crianca.component.css'
})
export class AlunoCriancaComponent implements OnInit {
  userName = signal('Amiguinho(a)');

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userName.set(user.nome);
      }
    }
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/auth']);
  }
}
