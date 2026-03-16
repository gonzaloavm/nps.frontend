import { Routes } from "@angular/router";
import { ResultsPage } from './pages/results-page/results-page';

export const ADMIN_ROUTES: Routes = [
    { path: 'results', loadComponent: () => import('./pages/results-page/results-page').then(m => m.ResultsPage), title: 'NPS - Resultados' },
    { path: 'voter-dashboard', loadComponent: () => import('./pages/voter-dashboard-page/voter-dashboard-page').then(m => m.VoterDashboardPage), title: 'NPS - Detallado de votantes' },
];
