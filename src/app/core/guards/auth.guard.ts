import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No SSR não há localStorage nem navegação; libera e deixa o client decidir
  if (!isPlatformBrowser(platformId)) return true;

  // No navegador, aplica a regra normal
  return auth.estaAutenticado() ? true : router.parseUrl('/entrar');
};
