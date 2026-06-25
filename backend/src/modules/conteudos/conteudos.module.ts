import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CONTEUDO_REPOSITORY } from './domain/ports/conteudo-repository.port';
import { ConteudoRepository } from './infrastructure/persistence/conteudo.repository';
import { ConteudosController } from './presentation/controllers/conteudos.controller';
import {
  CreateConteudoUseCase,
  DeleteConteudoUseCase,
  GetAllConteudosUseCase,
  GetConteudoUseCase,
  UpdateConteudoUseCase,
} from './domain/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ConteudosController],
  providers: [
    { provide: CONTEUDO_REPOSITORY, useClass: ConteudoRepository },
    CreateConteudoUseCase,
    GetAllConteudosUseCase,
    GetConteudoUseCase,
    UpdateConteudoUseCase,
    DeleteConteudoUseCase,
  ],
})
export class ConteudosModule {}