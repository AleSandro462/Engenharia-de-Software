import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const perfilGuard = (secao: string): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.usuarioLogado()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.podeAcessar(secao)) {
    return true;
  }
  return router.createUrlTree([auth.rotaInicial()]);
};