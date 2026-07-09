import { Module } from '@nestjs/common';
import { AtividadesController } from './presentation/controllers/atividades.controller';
import { AtividadeRepository } from './infrastructure/presistence/atividade.repository';
import { DeleteAtividadeUseCase } from './domain/use-cases/delete-atividade.use-case';
import { UpdateAtividadeUseCase } from './domain/use-cases/update-atividade.use-case';
import { GetAtividadeUseCase } from './domain/use-cases/get-atividade.use-casa';
import { GetAllAtividadesUseCase } from './domain/use-cases/get-all-atividades.use-case';
import { CreateAtividadeUseCase } from './domain/use-cases/create-atividade.use-case';
import { ResponderAtividadeUseCase } from './domain/use-cases/responder-atividade.use-case';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AtividadesController],
  providers: [{
    provide: 'ATIVIDADE_REPOSITORY',
    useClass: AtividadeRepository,
  },
  CreateAtividadeUseCase,
  GetAllAtividadesUseCase,
  GetAtividadeUseCase,
  UpdateAtividadeUseCase,
  DeleteAtividadeUseCase,
  ResponderAtividadeUseCase
],

})
export class AtividadesModule {}
