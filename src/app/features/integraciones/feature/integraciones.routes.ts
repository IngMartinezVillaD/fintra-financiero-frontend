import { Routes } from '@angular/router';

export const INTEGRACIONES_ROUTES: Routes = [
  {
    path: 'estado',
    loadComponent: () =>
      import('./integraciones-estado.page').then(m => m.IntegracionesEstadoPage),
  },
  { path: '', redirectTo: 'estado', pathMatch: 'full' },
];
