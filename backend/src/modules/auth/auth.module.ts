import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '@/prisma/prisma.module';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';
import { RolesInterceptor } from './infrastructure/interceptors/roles.interceptor';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PermissionsGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: RolesInterceptor,
    },
  ],
  exports: [PermissionsGuard],
})
export class AuthModule {}
