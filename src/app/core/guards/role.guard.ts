import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const expectedRole = route.data['role'];

  if (user && user.roles.includes(expectedRole)) {
    return true;
  }

  // Si no tiene el rol, lo mandamos a una página de "No autorizado" o al inicio
  router.navigate(['/unauthorized']);
  return false;
};
