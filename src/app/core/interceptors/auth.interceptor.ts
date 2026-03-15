import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, throwError, Observable, switchMap, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ActivityService } from '../services/activity.service';

// Variable para evitar múltiples peticiones de refresco simultáneas
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const activityService = inject(ActivityService)
  const token = authService.accessToken();
  const isAuthPath = req.url.includes('/login') || req.url.includes('/refresh');

  if (isAuthPath) return next(req);

  if (!token) return next(req);

  if (authService.isTokenExpired()) {
    return handle401Error(authService, activityService, req, next);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authService, activityService, authReq, next);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  authService: AuthService,
  activityService: ActivityService,
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshSession().pipe(
      switchMap((res) => {
        isRefreshing = false;
        const newToken = res?.data?.jwt;
        if (!newToken) {
          // Si no viene token, forzamos logout y fallamos
          authService.logout();
          activityService.stop();
          return throwError(() => new Error('No token after refresh'));
        }
        refreshTokenSubject.next(newToken);
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        activityService.stop();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      // Aseguramos al compilador que el token ya no es null
      filter((t): t is string => t !== null),
      take(1),
      switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
    );
  }
}
