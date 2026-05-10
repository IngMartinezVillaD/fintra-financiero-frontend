import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div class="text-center space-y-4">
        <span class="material-symbols-outlined text-6xl text-danger">error</span>
        <h1 class="text-2xl font-bold text-neutral-900">Error inesperado</h1>
        <p class="text-neutral-500">Ha ocurrido un error. Por favor intente nuevamente.</p>
        <a routerLink="/" class="btn-primary inline-block mt-2">Ir al inicio</a>
      </div>
    </div>
  `,
})
export class ErrorPage {}
