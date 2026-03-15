import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

let canAccessSessionExpired = false;

export const allowSessionExpiredAccess = () => {
  canAccessSessionExpired = true;
};

export const sessionExpiredGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (canAccessSessionExpired) {
    // Resetear para que no puedan volver manualmente
    canAccessSessionExpired = false;
    return true;
  }

  // Si intentan acceder directamente, redirigir al login
  router.navigate(['/login']);
  return false;
};
