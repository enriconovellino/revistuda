import { Inject, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { UseCase } from '@/shared/interfaces/use-case.interface';
import * as bcrypt from 'bcryptjs';

export interface UpdateUserInput {
  id: number;
  nome?: string;
  email?: string;
  senha?: string;
  permissions?: string[];
  approved?: boolean;
  turma_id?: number | null;
}

@Injectable()
export class UpdateUserUseCase implements UseCase<UpdateUserInput, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const { id, ...updateData } = input;
    if (updateData.senha) {
      updateData.senha = await bcrypt.hash(updateData.senha, 10);
    }
    return this.userRepository.update(id, updateData);
  }
}
