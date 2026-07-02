import { resolvePermissions } from './roles-permissions';

describe('resolvePermissions', () => {
  it('should prepend the role name and expand ADM to the full permission set', () => {
    const permissions = resolvePermissions('ADM');

    expect(permissions[0]).toBe('ADM');
    expect(permissions).toEqual(
      expect.arrayContaining(['users.create', 'users.read', 'users.update', 'users.delete']),
    );
    expect(permissions).toEqual(expect.arrayContaining(['modulos.read', 'conteudos.read']));
  });

  it('should include role marker and student permissions for child and elderly roles', () => {
    const crianca = resolvePermissions('ALUNO_CRIANCA');
    expect(crianca[0]).toBe('ALUNO_CRIANCA');
    expect(crianca).toEqual(
      expect.arrayContaining(['modulos.read', 'conteudos.read', 'dashboard.read']),
    );

    const idoso = resolvePermissions('ALUNO_IDOSO');
    expect(idoso[0]).toBe('ALUNO_IDOSO');
    expect(idoso).toEqual(
      expect.arrayContaining(['modulos.read', 'conteudos.read', 'dashboard.read']),
    );
  });

  it('should keep custom permission strings unchanged', () => {
    expect(resolvePermissions('users.read')).toEqual(['users.read']);
  });
});
