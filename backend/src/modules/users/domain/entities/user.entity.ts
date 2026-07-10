export class User {
  id!: number;
  nome!: string;
  email!: string;
  senha!: string;
  permissions!: string[];
  approved!: boolean;
  turma_id?: number | null;

  constructor(id: number, nome: string, email: string, senha: string, permissions: string[] = [], approved: boolean = true, turma_id?: number | null) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.permissions = permissions;
    this.approved = approved;
    this.turma_id = turma_id;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  addPermission(permission: string): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  removePermission(permission: string): void {
    this.permissions = this.permissions.filter((p) => p !== permission);
  }
}
