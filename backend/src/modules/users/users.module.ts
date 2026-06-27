import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersController } from './presentation/controllers/users.controller';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import {
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
} from './domain/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    // Casos de Uso
    GetAllUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    // Repositório
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
