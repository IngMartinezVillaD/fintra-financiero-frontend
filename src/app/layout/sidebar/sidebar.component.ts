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
      class="bg-brand-secondary text-white flex flex-col h-full transition-all duration-300 overflow-hidden shrink-0">

      <!-- Logo -->
      <div class="flex items-center border-b border-brand-primary"
           [class]="layout.collapsed() ? 'p-3 justify-center' : 'p-4 gap-3'">
        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
          <span class="text-brand-primary font-bold text-sm">F</span>
        </div>
        @if (!layout.collapsed()) {
          <span class="font-semibold text-sm truncate">Fintra Financiero</span>
        }
      </div>

      <!-- Navegación -->
      <nav class="flex-1 py-3 space-y-0.5" [class]="layout.collapsed() ? 'px-2' : 'px-3'">
        @for (item of visibleItems(); track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="bg-brand-primary !text-white"
             [title]="layout.collapsed() ? item.label : ''"
             class="flex items-center rounded-lg text-sm font-medium text-blue-200
                    hover:bg-brand-primary hover:text-white transition-colors"
             [class]="layout.collapsed() ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'">
            <span class="text-base shrink-0">{{ item.icon }}</span>
            @if (!layout.collapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Usuario -->
      @if (!layout.collapsed()) {
        <div class="p-4 border-t border-brand-primary">
          <p class="text-xs text-blue-300 truncate font-medium">{{ authStore.user()?.nombre }}</p>
          <p class="text-xs text-blue-400 truncate mt-0.5">{{ authStore.user()?.roles?.join(', ') }}</p>
        </div>
      } @else {
        <div class="p-3 border-t border-brand-primary flex justify-center">
          <div class="w-7 h-7 bg-brand-primary rounded-full flex items-center justify-center"
               [title]="authStore.user()?.nombre ?? ''">
            <span class="text-white text-xs font-bold">
              {{ authStore.user()?.nombre?.charAt(0) ?? 'U' }}
            </span>
          </div>
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly layout   = inject(LayoutService);

  private readonly navItems: NavItem[] = [
    { label: 'Health Check', path: '/health',                icon: '💚', roles: [] },
    { label: 'Operaciones',  path: '/prestamos',             icon: '📋', roles: ['ADMIN', 'TESORERIA'] },
    { label: 'Aprobaciones', path: '/prestamos/aprobaciones',icon: '✅', roles: ['APROBADOR', 'ADMIN'] },
    { label: 'Liquidación',  path: '/prestamos/liquidacion', icon: '📊', roles: ['TESORERIA', 'ADMIN'] },
    { label: 'Reportes',     path: '/reportes',              icon: '📈', roles: ['ADMIN', 'TESORERIA', 'CONTABILIDAD'] },
  ];

  protected visibleItems() {
    const userRoles = this.authStore.userRoles();
    return this.navItems.filter(item =>
      item.roles.length === 0 || item.roles.some(r => userRoles.includes(r))
    );
  }
}
