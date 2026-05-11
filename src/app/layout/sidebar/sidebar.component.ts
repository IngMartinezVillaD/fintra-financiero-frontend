import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { LayoutService } from '../layout.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
  section?: string;  // label de sección (encabezado visual)
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
          @if (item.section && !layout.collapsed()) {
            <p class="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {{ item.section }}
            </p>
          }
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
    { label: 'Dashboard',           path: '/dashboard',                      icon: 'dashboard',         roles: ['ADMIN','TESORERIA','APROBADOR','CONTABILIDAD','CONSULTA'], section: 'Módulo 9' },
    { label: 'Operaciones',         path: '/operaciones',                    icon: 'receipt_long',      roles: ['ADMIN','TESORERIA','EMPRESA_RECEPTORA'] },
    { label: 'Nueva operación',     path: '/operaciones/nueva',              icon: 'add_circle',        roles: ['ADMIN','TESORERIA'] },
    { label: 'Pend. aprobación',    path: '/operaciones/aprobacion-interna', icon: 'task_alt',          roles: ['APROBADOR','ADMIN'] },
    { label: 'Bandeja empresa',     path: '/operaciones/aceptacion-empresa', icon: 'handshake',         roles: ['EMPRESA_RECEPTORA','ADMIN'] },
    { label: 'Desembolsos',         path: '/operaciones/desembolsos',        icon: 'payments',          roles: ['ADMIN','TESORERIA'] },
    { label: 'Seguimiento',         path: '/operaciones/seguimiento',        icon: 'monitoring',        roles: ['ADMIN','TESORERIA','APROBADOR','CONTABILIDAD','CONSULTA'] },
    { label: 'Liquidación mensual', path: '/liquidaciones-mensuales',        section: 'Gestión',        icon: 'account_balance',   roles: ['ADMIN','TESORERIA','APROBADOR','CONTABILIDAD'] },
    { label: 'Control GMF',         path: '/controles/gmf',                  icon: 'receipt',           roles: ['ADMIN','TESORERIA','CONTABILIDAD'] },
    { label: 'Interés presunto',    path: '/controles/presunto',             icon: 'gavel',             roles: ['ADMIN','TESORERIA','CONTABILIDAD'] },
    { label: 'Reportes',            path: '/dashboard/reportes',             section: 'Config.',             icon: 'bar_chart',         roles: ['ADMIN','TESORERIA','CONTABILIDAD'] },
    { label: 'Empresas',            path: '/configuracion/empresas',         icon: 'domain',            roles: ['ADMIN'] },
    { label: 'Tasas',               path: '/configuracion/tasas-periodo',    icon: 'percent',           roles: ['ADMIN','TESORERIA','APROBADOR'] },
    { label: 'Integraciones',       path: '/integraciones/estado',           icon: 'settings_ethernet', roles: ['ADMIN'] },
  ];

  protected visibleItems() {
    const userRoles = this.authStore.userRoles();
    return this.navItems.filter(item =>
      item.roles.length === 0 || item.roles.some(r => userRoles.includes(r))
    );
  }
}
