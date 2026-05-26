import { Inject, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { UseCase } from '@/shared/interfaces/use-case.interface';

@Injectable()
export class GetAllUsersUseCase implements UseCase<void, User[]> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
