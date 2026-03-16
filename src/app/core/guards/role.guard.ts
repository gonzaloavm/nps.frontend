import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const token = authService.accessToken(); // Agregamos el check de token
  const expectedRole = route.data['role'];

  // 1. Si no hay token o el usuario es nulo, nos callamos.
  // Devolvemos false pero NO redirigimos, porque el authGuard ya lo hizo.
  if (!token || !user) {
    return false;
  }

  // 2. Si hay usuario pero NO tiene el rol, entonces SÍ es un tema de autorización
  if (!user.roles.includes(expectedRole)) {
    router.navigate(['/other/unauthorized']);
    console.log("redirigio")
    return false;
  }

  return true;
};
