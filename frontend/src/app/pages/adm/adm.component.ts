import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './adm.component.html',
  styleUrl: './adm.component.css'
})
export class AdmComponent implements OnInit {
  userName = signal('Administrador');

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user?.nome) {
      this.userName.set(user.nome);
    }
  }

  logout() {
    this.authService.logout();
  }
}
