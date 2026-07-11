import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { RelatoriosController } from './presentation/controllers/relatorios.controller';
import { GetRelatorioOverviewUseCase } from './domain/use-cases/get-relatorio-overview.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [RelatoriosController],
  providers: [GetRelatorioOverviewUseCase],
})
export class RelatoriosModule {}
