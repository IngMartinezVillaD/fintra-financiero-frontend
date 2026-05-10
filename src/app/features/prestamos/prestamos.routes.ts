import { Routes } from '@angular/router';

export const PRESTAMOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/prestamos-list.page').then(m => m.PrestamosListPage),
  },
];
