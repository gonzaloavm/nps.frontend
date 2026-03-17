import { Routes } from "@angular/router";

export const VOTER_ROUTES: Routes = [
    { path: 'vote', loadComponent: () => import('./pages/vote-page/vote-page').then(m => m.VotePage), title: 'NPS - Votar' },
];
