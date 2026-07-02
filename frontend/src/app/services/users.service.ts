import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface User {
  id: number;
  nome: string;
  email: string;
  permissions: string[];
}

export interface CreateUserPayload {
  nome: string;
  email: string;
  senha: string;
  permission: string;
}

export interface UpdateUserPayload {
  nome?: string;
  email?: string;
  permissions?: string[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  getAll(): Promise<User[]> {
    return this.api.get<User[]>('/users');
  }

  create(payload: CreateUserPayload): Promise<unknown> {
    return this.api.post<unknown>('/auth/register', payload);
  }

  update(id: number, payload: UpdateUserPayload): Promise<User> {
    return this.api.put<User>(`/users/${id}`, payload);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(`/users/${id}`);
  }
}
