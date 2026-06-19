import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ModulosModule } from './modules/modulos/modulos.module';
import { TurmasModule } from './modules/turmas/turmas.module';
import { AtividadesModule } from './modules/atividades/atividades.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ModulosModule, TurmasModule, AtividadesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
