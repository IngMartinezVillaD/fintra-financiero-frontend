import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface Crumb { label: string; path?: string; }

const ROUTE_LABELS: Record<string, string> = {
  health:         'Estado del sistema',
  prestamos:      'Préstamos',
  configuracion:  'Configuración',
  empresas:       'Empresas',
  tasas:          'Tasas y Períodos',
  operaciones:    'Operaciones',
};

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-neutral-500">
      @for (crumb of crumbs(); track crumb.label; let last = $last) {
        @if (!last && crumb.path) {
          <a [routerLink]="crumb.path"
             class="hover:text-brand-primary transition-colors">{{ crumb.label }}</a>
          <span class="text-neutral-300" aria-hidden="true">/</span>
        } @else {
          <span [class.text-neutral-900]="last" [class.font-medium]="last">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);

  protected readonly crumbs = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.buildCrumbs(this.router.url))
    ),
    { initialValue: this.buildCrumbs(this.router.url) }
  );

  private buildCrumbs(url: string): Crumb[] {
    const segments = url.split('/').filter(Boolean);
    const crumbs: Crumb[] = [{ label: 'Inicio', path: '/' }];
    let path = '';
    for (const seg of segments) {
      path += `/${seg}`;
      const label = ROUTE_LABELS[seg] ?? seg;
      crumbs.push({ label, path });
    }
    return crumbs;
  }
}
