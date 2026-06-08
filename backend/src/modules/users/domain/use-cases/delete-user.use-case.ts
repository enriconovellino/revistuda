import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { UseCase } from '@/shared/interfaces/use-case.interface';

@Injectable()
export class DeleteUserUseCase implements UseCase<number, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    return this.userRepository.delete(userId);
  }
}
