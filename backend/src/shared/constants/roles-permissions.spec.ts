import { resolvePermissions } from './roles-permissions';

describe('resolvePermissions', () => {
  it('should expand admin role to the full permission set', () => {
    const permissions = resolvePermissions('ADM');

    expect(permissions).toEqual(
      expect.arrayContaining(['users.create', 'users.read', 'users.update', 'users.delete']),
    );
    expect(permissions).toEqual(expect.arrayContaining(['modulos.read', 'conteudos.read']));
  });

  it('should assign student permissions for child and elderly roles', () => {
    expect(resolvePermissions('ALUNO_CRIANCA')).toEqual(
      expect.arrayContaining(['modulos.read', 'conteudos.read', 'dashboard.read']),
    );

    expect(resolvePermissions('ALUNO_IDOSO')).toEqual(
      expect.arrayContaining(['modulos.read', 'conteudos.read', 'dashboard.read']),
    );
  });

  it('should keep custom permission strings unchanged', () => {
    expect(resolvePermissions('users.read')).toEqual(['users.read']);
  });
});
