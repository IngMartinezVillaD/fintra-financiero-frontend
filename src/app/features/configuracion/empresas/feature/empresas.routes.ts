import { Routes } from '@angular/router';

export const EMPRESAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./empresas-list.page').then(m => m.EmpresasListPage),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./empresa-form.page').then(m => m.EmpresaFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./empresa-form.page').then(m => m.EmpresaFormPage),
  },
];
