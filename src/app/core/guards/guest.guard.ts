import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si no hay token, es guest: permitir acceso
  if (!auth.accessToken()) {
    return true;
  }

  // Usuario autenticado: obtener rol y redirigir según corresponda
  const user = auth.currentUser();
  const role = user?.roles?.[0]?.toString().trim().toLowerCase();

  if (role === 'admin') {
    return router.createUrlTree(['/admin/results']);
  }

  return router.createUrlTree(['/voter/vote']);
};
