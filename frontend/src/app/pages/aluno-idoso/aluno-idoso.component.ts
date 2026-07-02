import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aluno-idoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aluno-idoso.component.html',
  styleUrl: './aluno-idoso.component.css'
})
export class AlunoIdosoComponent implements OnInit {
  userName = signal('Aluno');
  fontSize = signal(1.1); // Font size multiplier in rem

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName.set(user.nome);
    }
  }

  changeFontSize(offset: number) {
    const nextSize = parseFloat((this.fontSize() + offset).toFixed(1));
    if (nextSize >= 0.8 && nextSize <= 1.8) {
      this.fontSize.set(nextSize);
    }
  }

  logout() {
    this.authService.logout();
  }
}
