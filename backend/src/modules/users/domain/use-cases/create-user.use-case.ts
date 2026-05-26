import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import { User } from '../entities/user.entity';
import type { UseCase } from '@/shared/interfaces/use-case.interface';

export interface CreateUserInput {
  nome: string;
  email: string;
  permissions?: string[];
}

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserInput, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const user = new User(0, input.nome, input.email, input.permissions || []);
    return this.userRepository.create(user);
  }
}
