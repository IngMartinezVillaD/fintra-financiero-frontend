import { Routes } from '@angular/router';

export const TASAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./tasas-list.page').then(m => m.TasasListPage),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./tasa-form.page').then(m => m.TasaFormPage),
  },
];
