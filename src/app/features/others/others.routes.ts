import { Routes } from "@angular/router";
import { sessionExpiredGuard } from "../../core/guards/session-expired.guard";

export const OTHERS_ROUTES: Routes = [
      {
        path: 'session-expired',
        loadComponent: () => import('./pages/session-expired-page/session-expired-page').then(m => m.SessionExpiredPage),
        canActivate: [sessionExpiredGuard]
      },
];
