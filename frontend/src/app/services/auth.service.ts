import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  permission: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  permissions: string[];
  approved: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private backendUrl = `${environment.apiUrl}/auth`;

  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${this.backendUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Falha no login');
    }

    this.saveSession(data);
    return data;
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.backendUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Falha no registro');
    }

    return data;
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetch(`${this.backendUrl}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Falha ao atualizar token');
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  }

  async getMe(): Promise<User> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Sem token de acesso');
    }

    const response = await fetch(`${this.backendUrl}/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Falha ao obter perfil');
    }
    return data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.backendUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Falha ao solicitar recuperação');
    }
    return data;
  }

  async resetPassword(token: string, novaSenha: string): Promise<{ message: string }> {
    const response = await fetch(`${this.backendUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, novaSenha })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Falha ao redefinir senha');
    }
    return data;
  }

  saveSession(authResponse: AuthResponse) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
    this.router.navigate(['/']);
  }

  redirectUserBasedOnRole(user: User) {
    const permissions: string[] = user.permissions || [];
    if (permissions.includes('ADM')) {
      this.router.navigate(['/adm']);
    } else if (permissions.includes('PROFESSOR')) {
      this.router.navigate(['/professor']);
    } else if (permissions.includes('ALUNO_IDOSO')) {
      this.router.navigate(['/aluno-idoso']);
    } else {
      this.logout();
    }
  }
}