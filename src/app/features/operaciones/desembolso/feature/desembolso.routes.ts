import { Routes } from '@angular/router';

export const DESEMBOLSO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./desembolsos-pendientes.page').then(m => m.DesembolsosPendientesPage),
  },
  {
    path: ':id/confirmar',
    loadComponent: () =>
      import('./confirmar-desembolso.page').then(m => m.ConfirmarDesembolsoPage),
  },
];
