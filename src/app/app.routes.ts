import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.page').then(m => m.LoginPage),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/forbidden/forbidden.page').then(m => m.ForbiddenPage),
  },
  {
    path: 'error',
    loadComponent: () => import('./features/error/error.page').then(m => m.ErrorPage),
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
      {
        path: 'operaciones',
        loadChildren: () => import('./features/operaciones/feature/operaciones.routes').then(m => m.OPERACIONES_ROUTES),
      },
      {
        path: 'liquidaciones-mensuales',
        loadChildren: () =>
          import('./features/liquidacion-mensual/feature/liquidacion.routes').then(m => m.LIQUIDACION_ROUTES),
      },
      {
        path: 'integraciones',
        loadChildren: () =>
          import('./features/integraciones/feature/integraciones.routes').then(m => m.INTEGRACIONES_ROUTES),
      },
      {
        path: 'controles',
        loadChildren: () =>
          import('./features/controles/feature/controles.routes').then(m => m.CONTROLES_ROUTES),
      },
      {
        path: 'configuracion/empresas',
        loadChildren: () => import('./features/configuracion/empresas/feature/empresas.routes').then(m => m.EMPRESAS_ROUTES),
      },
      {
        path: 'configuracion/tasas-periodo',
        loadChildren: () => import('./features/configuracion/tasas-periodo/feature/tasas.routes').then(m => m.TASAS_ROUTES),
      },
      { path: '', redirectTo: 'health', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
