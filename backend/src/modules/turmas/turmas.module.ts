import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { TURMA_REPOSITORY } from './domain/ports/turma-repository.port';
import { TurmaRepository } from './infrastructure/persistence/turma.repository';
import { TurmasController } from './presentation/controllers/turmas.controller';
import {
  CreateTurmaUseCase,
  DeleteTurmaUseCase,
  GetAllTurmasUseCase,
  GetTurmasByProfessorUseCase,
  GetTurmaUseCase,
  UpdateTurmaUseCase,
} from './domain/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [TurmasController],
  providers: [
    { provide: TURMA_REPOSITORY, useClass: TurmaRepository },
    CreateTurmaUseCase,
    GetAllTurmasUseCase,
    GetTurmaUseCase,
    UpdateTurmaUseCase,
    DeleteTurmaUseCase,
    GetTurmasByProfessorUseCase
  ],
})
export class TurmasModule {}