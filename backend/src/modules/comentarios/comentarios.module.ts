import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { COMENTARIO_REPOSITORY } from './domain/ports/comentario-repository.port';
import { ComentarioRepository } from './infrastructure/persistence/comentario.repository';
import { ComentariosController } from './presentation/controllers/comentarios.controller';
import {
  SaveComentarioUseCase,
  GetComentariosByConteudoUseCase,
  GetComentariosByModuloUseCase,
  GetComentariosByProfessorUseCase,
} from './domain/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ComentariosController],
  providers: [
    { provide: COMENTARIO_REPOSITORY, useClass: ComentarioRepository },
    SaveComentarioUseCase,
    GetComentariosByConteudoUseCase,
    GetComentariosByModuloUseCase,
    GetComentariosByProfessorUseCase,
  ],
})
export class ComentariosModule {}