import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { LayoutService } from '../layout.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      [class]="layout.collapsed() ? 'w-16' : 'w-64'"
      class="bg-neutral-900 text-white flex flex-col h-full transition-all duration-300 overflow-hidden shrink-0">

      <!-- Logo -->
      <div class="flex items-center border-b border-neutral-700/60"
           [class]="layout.collapsed() ? 'p-3 justify-center h-16' : 'p-4 gap-3 h-16'">
        <div class="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-sm">F</span>
        </div>
        @if (!layout.collapsed()) {
          <span class="font-semibold text-sm text-white truncate">Fintra Financiero</span>
        }
      </div>

      <!-- Navegación -->
      <nav class="flex-1 py-4 space-y-0.5 overflow-y-auto"
           [class]="layout.collapsed() ? 'px-2' : 'px-3'">
        @for (item of visibleItems(); track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="bg-brand-primary/20 text-white border-l-2 border-brand-accent"
             [routerLinkActiveOptions]="{ exact: false }"
             [title]="layout.collapsed() ? item.label : ''"
             class="flex items-center rounded-lg text-sm font-medium text-neutral-400
                    hover:bg-neutral-800 hover:text-white transition-colors border-l-2 border-transparent"
             [class]="layout.collapsed() ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'">
            <span class="material-symbols-outlined text-[18px] shrink-0">{{ item.icon }}</span>
            @if (!layout.collapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Usuario -->
      <div class="border-t border-neutral-700/60"
           [class]="layout.collapsed() ? 'p-3' : 'p-4'">
        @if (!layout.collapsed()) {
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
              <span class="text-white text-xs font-bold">
                {{ authStore.user()?.nombre?.charAt(0) ?? 'U' }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-xs text-neutral-200 truncate font-medium">{{ authStore.user()?.nombre }}</p>
              <p class="text-xs text-neutral-500 truncate mt-0.5">{{ authStore.user()?.roles?.join(', ') }}</p>
            </div>
          </div>
        } @else {
          <div class="flex justify-center">
            <div class="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center"
                 [title]="authStore.user()?.nombre ?? ''">
              <span class="text-white text-xs font-bold">
                {{ authStore.user()?.nombre?.charAt(0) ?? 'U' }}
              </span>
            </div>
          </div>
        }
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly layout   = inject(LayoutService);

  private readonly navItems: NavItem[] = [
    { label: 'Health Check', path: '/health',                   icon: 'monitor_heart',   roles: [] },
    { label: 'Operaciones',  path: '/prestamos',                icon: 'receipt_long',    roles: ['ADMIN', 'TESORERIA'] },
    { label: 'Aprobaciones', path: '/prestamos/aprobaciones',   icon: 'task_alt',        roles: ['APROBADOR', 'ADMIN'] },
    { label: 'Liquidación',  path: '/prestamos/liquidacion',    icon: 'account_balance', roles: ['TESORERIA', 'ADMIN'] },
    { label: 'Empresas',     path: '/configuracion/empresas',       icon: 'domain',          roles: ['ADMIN'] },
    { label: 'Tasas',        path: '/configuracion/tasas-periodo', icon: 'percent',         roles: ['ADMIN', 'TESORERIA', 'APROBADOR'] },
    { label: 'Reportes',     path: '/reportes',                 icon: 'bar_chart',       roles: ['ADMIN', 'TESORERIA', 'CONTABILIDAD'] },
  ];

  protected visibleItems() {
    const userRoles = this.authStore.userRoles();
    return this.navItems.filter(item =>
      item.roles.length === 0 || item.roles.some(r => userRoles.includes(r))
    );
  }
}
