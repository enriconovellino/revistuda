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