import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '@/prisma/prisma.module';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';
import { RolesInterceptor } from './infrastructure/interceptors/roles.interceptor';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PermissionsGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: RolesInterceptor,
    },
  ],
  exports: [PermissionsGuard, AuthService],
})
export class AuthModule {}
