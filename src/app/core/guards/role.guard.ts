import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: Array<'Admin' | 'Voter'>): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.role();
    if (userRole && allowedRoles.includes(userRole as 'Admin' | 'Voter')) {
      return true;
    }

    return router.parseUrl('/login');
  };
};
