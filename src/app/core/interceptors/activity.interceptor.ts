import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivityService } from '../services/activity.service';
import { tap } from 'rxjs';

export const activityInterceptor: HttpInterceptorFn = (req, next) => {
  const activityService = inject(ActivityService);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        // Solo reseteamos actividad si la petición NO es de autenticación
        // y fue exitosa (200 OK).
        if (!req.url.includes('/auth/')) {
          activityService.updateActivity();
        }
      }
    })
  );
};
