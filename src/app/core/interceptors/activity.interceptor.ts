import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivityService } from '../services/activity.service';

export const activityInterceptor: HttpInterceptorFn = (req, next) => {
  const activityService = inject(ActivityService);
  activityService.updateActivity();
  return next(req);
};
