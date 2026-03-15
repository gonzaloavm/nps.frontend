import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ActivityService } from '../services/activity.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const activityService = inject(ActivityService)
  const router = inject(Router);

  const token = authService.accessToken();
  if (token && !authService.isTokenExpired()) {
    return true;
  }

  return authService.refreshSession().pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      activityService.stop();
      return of(router.parseUrl('/login'));
    })
  );
};
