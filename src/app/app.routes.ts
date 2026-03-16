import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { MainLayout } from './layouts/main-layout/main-layout';
import { VOTER_ROUTES } from './features/voter/vote.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { OTHERS_ROUTES } from './features/others/others.routes';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { canActivate: [guestGuard], component: AuthLayout, path: '', children: AUTH_ROUTES },
    { canActivate: [authGuard, roleGuard], data: { role: 'Voter' }, component: MainLayout, path: 'voter', children: VOTER_ROUTES },
    { canActivate: [authGuard, roleGuard], data: { role: 'Admin' }, component: MainLayout, path: 'admin', children: ADMIN_ROUTES },
    { path: 'other', children: OTHERS_ROUTES },

];
