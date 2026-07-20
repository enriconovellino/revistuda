import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginData, RegisterData, AuthResponse, User } from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private backendUrl = `${environment.apiUrl}/auth`;
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

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

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fetch(url, options);
    }

    const accessToken = this.getAccessToken();
    const authOptions = this.injectToken(options, accessToken);

    let response = await fetch(url, authOptions);

    if (response.status !== 401) {
      return response;
    }

    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      this.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!this.refreshPromise) {
      const refreshingAt = localStorage.getItem('refreshing');
      const isAnotherTabRefreshing =
        refreshingAt && Date.now() - parseInt(refreshingAt, 10) < 5000;

      if (isAnotherTabRefreshing) {
        this.refreshPromise = this.waitForCrossTabRefresh().finally(() => {
          this.refreshPromise = null;
        });
      } else {
        this.refreshPromise = this.doRefresh(storedRefreshToken).finally(() => {
          this.refreshPromise = null;
        });
      }
    }

    try {
      const tokens = await this.refreshPromise;
      const retryOptions = this.injectToken(options, tokens.accessToken);
      response = await fetch(url, retryOptions);

      if (response.status === 401) {
        this.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      return response;
    } catch {
      this.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  private async doRefresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    localStorage.setItem('refreshing', Date.now().toString());
    try {
      return await this.refresh(refreshToken);
    } finally {
      localStorage.removeItem('refreshing');
    }
  }

  private waitForCrossTabRefresh(): Promise<{ accessToken: string; refreshToken: string }> {
    return new Promise((resolve, reject) => {
      const MAX_WAIT_MS = 5000;
      const POLL_INTERVAL_MS = 100;
      const startedAt = Date.now();

      const poll = setInterval(() => {
        const stillRefreshing = localStorage.getItem('refreshing');
        const newAccessToken = localStorage.getItem('accessToken');

        if (!stillRefreshing && newAccessToken) {
          clearInterval(poll);
          resolve({
            accessToken: newAccessToken,
            refreshToken: localStorage.getItem('refreshToken') ?? '',
          });
        } else if (Date.now() - startedAt > MAX_WAIT_MS) {
          clearInterval(poll);
          reject(new Error('Timeout aguardando renovação de token de outra guia.'));
        }
      }, POLL_INTERVAL_MS);
    });
  }

  private injectToken(options: RequestInit, token: string | null): RequestInit {
    if (!token) return options;
    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };
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

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return payload.exp < nowInSeconds;
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /** Limpa a sessão sem redirecionar — use quando precisar invalidar tokens mas manter o usuário na página. */
  clearSession() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  }

  logout() {
    this.clearSession();
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