import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    { path: 'login', loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage), title: 'Login' },
    { path: 'register', loadComponent: () => import('./pages/register-page/register-page').then(m => m.RegisterPage), title: 'Register' }
];
