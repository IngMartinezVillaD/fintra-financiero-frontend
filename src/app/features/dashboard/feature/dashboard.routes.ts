import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', redirectTo: 'cartera', pathMatch: 'full' },
  {
    path: 'cartera',
    loadComponent: () => import('./cartera.page').then(m => m.CarteraPage),
  },
  {
    path: 'resumen',
    loadComponent: () => import('./resumen.page').then(m => m.ResumenPage),
  },
  {
    path: 'indicadores',
    loadComponent: () => import('./indicadores.page').then(m => m.IndicadoresPage),
  },
  {
    path: 'reportes',
    loadComponent: () => import('./reportes.page').then(m => m.ReportesPage),
  },
];
