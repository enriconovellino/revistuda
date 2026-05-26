import { User } from '../../domain/entities/user.entity';

export class UserPresenter {
  id!: number;
  nome!: string;
  email!: string;
  permissions!: string[];

  static toPresentation(user: User): UserPresenter {
    const presenter = new UserPresenter();
    presenter.id = user.id;
    presenter.nome = user.nome;
    presenter.email = user.email;
    presenter.permissions = user.permissions;
    return presenter;
  }

  static toCollection(users: User[]): UserPresenter[] {
    return users.map((user) => this.toPresentation(user));
  }
}
