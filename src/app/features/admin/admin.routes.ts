import { Routes } from "@angular/router";
import { ResultsPage } from './pages/results-page/results-page';

export const ADMIN_ROUTES: Routes = [
    { path: 'results', loadComponent: () => import('./pages/results-page/results-page').then(m => m.ResultsPage), title: 'NPS - Resultados' },
    { path: 'users', loadComponent: () => import('./pages/user-list-page/user-list-page').then(m => m.UserListPage), title: 'NPS - Lista de usuarios' },
    { path: 'register-voter', loadComponent: () => import('./pages/register-user-voter/register-user-voter').then(m => m.RegisterUserVoter), title: 'NPS - Registrar Votante' },
];
