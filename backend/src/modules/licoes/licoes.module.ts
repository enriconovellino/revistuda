import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { LicioesController } from './presentation/controllers/licoes.controller';
import { LICAO_REPOSITORY } from './domain/ports/licao-repository.port';
import { LicaoRepository } from './infrastructure/persistence/licao.repository';
import { CreateLicaoUseCase } from './domain/use-cases/create-licao.use-case';
import { GetAllLicoes } from './domain/use-cases/get-all-licoes.use-case';
import { GetLicaoUseCase } from './domain/use-cases/get-licao.use-case';
import { UpdateLicaoUseCase } from './domain/use-cases/update-licao.use-case';
import { DeleteLicaoUseCase } from './domain/use-cases/delete-licao.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [LicioesController],
  providers: [
    { provide: LICAO_REPOSITORY, useClass: LicaoRepository },
    CreateLicaoUseCase,
    GetAllLicoes,
    GetLicaoUseCase,
    UpdateLicaoUseCase,
    DeleteLicaoUseCase,
  ],
})
export class LicoesModule {}
