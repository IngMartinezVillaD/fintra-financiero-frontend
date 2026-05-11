import { Routes } from '@angular/router';

export const CONTROLES_ROUTES: Routes = [
  {
    path: 'gmf',
    loadComponent: () => import('./gmf-control.page').then(m => m.GmfControlPage),
  },
  {
    path: 'presunto',
    loadComponent: () => import('./presunto-control.page').then(m => m.PresuntoControlPage),
  },
  { path: '', redirectTo: 'gmf', pathMatch: 'full' },
];
