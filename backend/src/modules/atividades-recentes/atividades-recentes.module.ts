import { Global, Module } from '@nestjs/common';
import { AtividadesRecentesController } from './atividades-recentes.controller';
import { AtividadesRecentesService } from './atividades-recentes.service';

/* Global para que auth, users e turmas registrem eventos sem precisar
   importar o módulo em cada um. */
@Global()
@Module({
  controllers: [AtividadesRecentesController],
  providers: [AtividadesRecentesService],
  exports: [AtividadesRecentesService],
})
export class AtividadesRecentesModule {}
