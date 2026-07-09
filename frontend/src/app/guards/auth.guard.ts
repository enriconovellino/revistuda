import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformServer(platformId)) {
      return true;
    }

    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getUser();

    if (!authService.isAuthenticated() || !user) {
      router.navigate(['/']);
      return false;
    }

    const userPermissions: string[] = user.permissions || [];
    const hasAllowedRole = userPermissions.some(permission => allowedRoles.includes(permission));

    if (hasAllowedRole) {
      return true;
    }

    // Redireciona o usuário para a rota correta do perfil dele
    authService.redirectUserBasedOnRole(user);
    return false;
  };
};
