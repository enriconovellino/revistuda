import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@/shared/decorators/permissions.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { resolvePermissions } from '@/shared/constants/roles-permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = this.extractUserIdFromRequest(request);

    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { permissions: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const permissions = (user.permissions ?? []).flatMap((permission) => resolvePermissions(permission));
    const uniquePermissions = [...new Set(permissions)];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      uniquePermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Permissão insuficiente');
    }

    return true;
  }

  private extractUserIdFromRequest(request: any): number | null {
    const headerValue = request.headers?.['x-user-id'] ?? request.headers?.['X-USER-ID'];

    if (!headerValue) {
      return null;
    }

    const userId = Number(headerValue);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  }
}
