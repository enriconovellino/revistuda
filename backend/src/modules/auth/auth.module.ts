import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class AuthModule {}
