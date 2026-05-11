import { Routes } from '@angular/router';

export const LIQUIDACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./liquidaciones-list.page').then(m => m.LiquidacionesListPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./liquidacion-detalle.page').then(m => m.LiquidacionDetallePage),
  },
];
