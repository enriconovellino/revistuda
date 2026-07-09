import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@/prisma/prisma.module';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';
import { RolesInterceptor } from './infrastructure/interceptors/roles.interceptor';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { MailerService } from '@/shared/infrastructure/mailer/mailer.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailerService,
    PermissionsGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: RolesInterceptor,
    },
  ],
  exports: [PermissionsGuard, AuthService],
})
export class AuthModule {}
