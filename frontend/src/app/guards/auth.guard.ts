import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();

  if (!accessToken) {
    router.navigate(['/']);
    return false;
  }

  if (!authService.isTokenExpired(accessToken)) {
    return true;
  }

  const refreshToken = typeof window !== 'undefined' && window.localStorage
    ? localStorage.getItem('refreshToken')
    : null;

  if (!refreshToken) {
    authService.logout();
    return false;
  }

  try {
    await authService.refresh(refreshToken);
    return true;
  } catch {
    authService.logout();
    return false;
  }
};
