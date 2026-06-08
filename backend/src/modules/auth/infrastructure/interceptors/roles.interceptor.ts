import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RolesInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // Extrair userId dos headers (case-insensitive)
    const userIdHeader = Object.keys(request.headers).find(
      (key) => key.toLowerCase() === 'x-user-id',
    );
    
    const userId = userIdHeader ? request.headers[userIdHeader] : null;

    if (userId) {
      try {
        // Buscar usuário com permissões do banco de dados
        const user = await this.prisma.user.findUnique({
          where: { id: parseInt(userId, 10) },
          select: {
            id: true,
            nome: true,
            email: true,
            permissions: true,
          },
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Anexar usuário à request para uso em controladores e guards
        request.user = user;
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Failed to validate user roles');
      }
    }

    return next.handle();
  }
}
