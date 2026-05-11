import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'reportes',
    loadComponent: () => import('./reportes.page').then(m => m.ReportesPage),
  },
];
