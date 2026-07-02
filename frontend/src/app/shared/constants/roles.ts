export type AppRole = 'ADM' | 'PROFESSOR' | 'ALUNO_CRIANCA' | 'ALUNO_IDOSO';

export const ROLE_LABELS: Record<AppRole, string> = {
  ADM: 'Administrador',
  PROFESSOR: 'Professor',
  ALUNO_CRIANCA: 'Aluno Criança',
  ALUNO_IDOSO: 'Aluno Idoso',
};

export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  ADM: [
    'ADM',
    'users.create', 'users.read', 'users.update', 'users.delete',
    'modulos.create', 'modulos.read', 'modulos.update', 'modulos.delete',
    'turmas.create', 'turmas.read', 'turmas.update', 'turmas.delete',
    'conteudos.create', 'conteudos.read', 'conteudos.update', 'conteudos.delete',
    'dashboard.read',
  ],
  PROFESSOR: [
    'PROFESSOR',
    'modulos.create', 'modulos.read', 'modulos.update',
    'turmas.read',
    'conteudos.create', 'conteudos.read', 'conteudos.update',
    'dashboard.read',
  ],
  ALUNO_CRIANCA: ['ALUNO_CRIANCA', 'modulos.read', 'conteudos.read', 'dashboard.read'],
  ALUNO_IDOSO: ['ALUNO_IDOSO', 'modulos.read', 'conteudos.read', 'dashboard.read'],
};

export const ALL_ROLES: AppRole[] = ['ADM', 'PROFESSOR', 'ALUNO_CRIANCA', 'ALUNO_IDOSO'];

export function detectRole(permissions: string[]): AppRole | null {
  if (permissions.includes('ADM')) return 'ADM';
  if (permissions.includes('PROFESSOR')) return 'PROFESSOR';
  if (permissions.includes('ALUNO_CRIANCA')) return 'ALUNO_CRIANCA';
  if (permissions.includes('ALUNO_IDOSO')) return 'ALUNO_IDOSO';
  return null;
}

export function getRoleLabel(permissions: string[]): string {
  const role = detectRole(permissions);
  return role ? ROLE_LABELS[role] : '—';
}
