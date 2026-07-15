import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  senha_atual?: string;
  permissions?: string[];
  approved?: boolean;
  rejected?: boolean;
  turma_id?: number | null;
}

@Injectable()
export class UpdateUserUseCase implements UseCase<UpdateUserInput, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const { id, senha_atual, ...updateData } = input;
    if (updateData.senha) {
      if (!senha_atual) {
        throw new BadRequestException('A senha atual é necessária para alterar a senha.');
      }
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }
      const match = await bcrypt.compare(senha_atual, user.senha);
      if (!match) {
        throw new BadRequestException('A senha atual inserida está incorreta.');
      }
      updateData.senha = await bcrypt.hash(updateData.senha, 10);
    }
    return this.userRepository.update(id, updateData);
  }
}
