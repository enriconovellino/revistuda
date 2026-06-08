import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { UseCase } from '@/shared/interfaces/use-case.interface';

@Injectable()
export class GetUserUseCase implements UseCase<number, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
