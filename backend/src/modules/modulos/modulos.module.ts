import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { MODULO_REPOSITORY } from './domain/ports/modulo-repository.port';
import { ModuloRepository } from './infrastructure/persistence/modulo.repository';
import { ModulosController } from './presentation/controllers/modulos.controller';
import {
  CreateModuloUseCase,
  DeleteModuloUseCase,
  GetAllModulosUseCase,
  GetModuloUseCase,
  UpdateModuloUseCase,
} from './domain/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ModulosController],
  providers: [
    { provide: MODULO_REPOSITORY, useClass: ModuloRepository },
    CreateModuloUseCase,
    GetAllModulosUseCase,
    GetModuloUseCase,
    UpdateModuloUseCase,
    DeleteModuloUseCase,
  ],
})
export class ModulosModule { }