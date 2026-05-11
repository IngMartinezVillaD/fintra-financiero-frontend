import { Routes } from '@angular/router';

export const OPERACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista-operaciones.page').then(m => m.ListaOperacionesPage),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./nueva-operacion.page').then(m => m.NuevaOperacionPage),
  },
  {
    path: 'aprobacion-interna',
    loadComponent: () => import('./bandeja-aprobador.page').then(m => m.BandejaAprobadorPage),
  },
  {
    path: 'aceptacion-empresa',
    loadComponent: () => import('./bandeja-empresa.page').then(m => m.BandejaEmpresaPage),
  },
  {
    path: 'desembolsos',
    loadChildren: () =>
      import('../desembolso/feature/desembolso.routes').then(m => m.DESEMBOLSO_ROUTES),
  },
  {
    path: ':id',
    loadComponent: () => import('./operacion-detalle.page').then(m => m.OperacionDetallePage),
  },
];
