import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { UseCase } from '@/shared/interfaces/use-case.interface';

export interface RevokeProfessorAccessOutput {
  user: User;
  turmasDesalocadas: number;
}

@Injectable()
export class RevokeProfessorAccessUseCase implements UseCase<number, RevokeProfessorAccessOutput> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: number): Promise<RevokeProfessorAccessOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.permissions.includes('PROFESSOR')) {
      throw new BadRequestException('Revogar acesso só é aplicável a usuários com o papel de professor');
    }

    return this.userRepository.revokeProfessorAccess(userId);
  }
}
