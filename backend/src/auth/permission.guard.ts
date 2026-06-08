import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

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
    const userId = parseUserIdFromRequest(request);

    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const user = await this.prisma.$queryRaw<
      { permissions: string[] | null } | null
    >`SELECT permissions FROM "User" WHERE id = ${userId} LIMIT 1`;

    if (!user || !user.permissions) {
      throw new UnauthorizedException('Usuário não encontrado ou sem permissões');
    }

    const permissions = user.permissions ?? [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Permissão insuficiente');
    }

    return true;
  }
}

function parseUserIdFromRequest(request: any): number | null {
  const headerValue = request.headers?.['x-user-id'] ?? request.headers?.['X-USER-ID'];

  if (!headerValue) {
    return null;
  }

  const userId = Number(headerValue);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}
