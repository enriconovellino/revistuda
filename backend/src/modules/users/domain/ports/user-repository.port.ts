import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  update(id: number, user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
