export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADM: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'modulos.create',
    'modulos.read',
    'modulos.update',
    'modulos.delete',
    'turmas.create',
    'turmas.read',
    'turmas.update',
    'turmas.delete',
    'conteudos.create',
    'conteudos.read',
    'conteudos.update',
    'conteudos.delete',
    'dashboard.read',
  ],
  PROFESSOR: [
    'modulos.create',
    'modulos.read',
    'modulos.update',
    'turmas.read',
    'conteudos.create',
    'conteudos.read',
    'conteudos.update',
    'dashboard.read',
  ],
  ALUNO_CRIANCA: ['modulos.read', 'conteudos.read', 'dashboard.read'],
  ALUNO_IDOSO: ['modulos.read', 'conteudos.read', 'dashboard.read'],
};

export function resolvePermissions(roleOrPermission: string): string[] {
  const normalizedValue = roleOrPermission?.trim();

  if (!normalizedValue) {
    return [];
  }

  return ROLE_PERMISSIONS[normalizedValue] ?? [normalizedValue];
}
