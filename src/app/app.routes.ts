import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.page').then(m => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.page').then(m => m.ShellPage),
    children: [
      {
        path: 'health',
        loadComponent: () => import('./features/health/health.page').then(m => m.HealthPage),
      },
      {
        path: 'prestamos',
        loadChildren: () => import('./features/prestamos/prestamos.routes').then(m => m.PRESTAMOS_ROUTES),
      },
      { path: '', redirectTo: 'health', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
