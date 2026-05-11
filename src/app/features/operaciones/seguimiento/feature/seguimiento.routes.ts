import { Routes } from '@angular/router';

export const SEGUIMIENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./seguimiento.page').then(m => m.SeguimientoPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./operacion-seguimiento-detalle.page').then(m => m.OperacionSeguimientoDetallePage),
  },
];
