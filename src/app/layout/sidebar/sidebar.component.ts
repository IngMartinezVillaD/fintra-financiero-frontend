import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { LayoutService } from '../layout.service';

interface NavLeaf {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

interface NavSubSection {
  key: string;
  label: string;
  icon: string;
  items: NavLeaf[];
}

interface NavModule {
  key: string;
  label: string;
  icon: string;
  subsections: NavSubSection[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      [class]="layout.collapsed() ? 'w-0 sm:w-16' : 'w-72'"
      class="bg-neutral-900 text-white flex flex-col h-full transition-all duration-300 overflow-hidden shrink-0">

      <!-- Logo -->
      <div class="flex items-center border-b border-neutral-700/60 shrink-0"
           [class]="layout.collapsed() ? 'p-3 justify-center h-16' : 'p-4 gap-3 h-16'">
        <div class="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-sm">F</span>
        </div>
        @if (!layout.collapsed()) {
          <span class="font-semibold text-sm text-white truncate">Fintra Financiero</span>
        }
      </div>

      <!-- Navegación -->
      <nav class="flex-1 overflow-y-auto py-2 sidebar-scroll"
           [class]="layout.collapsed() ? 'px-2 space-y-1' : 'px-2 space-y-0.5'">

        @if (layout.collapsed()) {
          <!-- Modo colapsado: solo íconos de módulo -->
          @for (mod of visibleModules(); track mod.key) {
            <button (click)="openModule(mod.key)"
                    [title]="mod.label"
                    class="w-full flex justify-center p-2.5 rounded-lg text-neutral-400
                           hover:bg-neutral-800 hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[20px]">{{ mod.icon }}</span>
            </button>
          }
        } @else {
          <!-- Modo expandido: árbol completo -->
          @for (mod of visibleModules(); track mod.key) {

            <!-- ── Cabecera de módulo ── -->
            <button (click)="toggleModule(mod.key)"
                    class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                           text-neutral-200 hover:bg-neutral-800 hover:text-white
                           transition-colors">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="material-symbols-outlined text-[18px] shrink-0 text-brand-primary">
                  {{ mod.icon }}
                </span>
                <span class="text-xs font-bold uppercase tracking-wide truncate">{{ mod.label }}</span>
              </div>
              <span class="material-symbols-outlined text-[16px] shrink-0 text-neutral-500
                           transition-transform duration-200"
                    [class.rotate-180]="isModuleExpanded(mod.key)">
                expand_more
              </span>
            </button>

            <!-- ── Contenido del módulo ── -->
            @if (isModuleExpanded(mod.key)) {
              <div class="ml-3 pl-2 border-l border-neutral-700/50 space-y-0.5 pb-1">

                @for (sec of visibleSections(mod); track sec.key) {

                  <!-- ── Cabecera de sección ── -->
                  <button (click)="toggleSection(mod.key, sec.key)"
                          class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md
                                 text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300
                                 transition-colors mt-0.5">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[13px] shrink-0">{{ sec.icon }}</span>
                      <span class="text-[11px] font-semibold uppercase tracking-wider">{{ sec.label }}</span>
                    </div>
                    <span class="material-symbols-outlined text-[13px] shrink-0 transition-transform duration-200"
                          [class.rotate-90]="isSectionExpanded(mod.key, sec.key)">
                      chevron_right
                    </span>
                  </button>

                  <!-- ── Items de la sección ── -->
                  @if (isSectionExpanded(mod.key, sec.key)) {
                    <div class="ml-2 pl-2 border-l border-neutral-700/30 space-y-0.5">
                      @if (visibleLeafs(sec.items).length === 0) {
                        <p class="px-3 py-1.5 text-[11px] text-neutral-600 italic">Próximamente</p>
                      } @else {
                        @for (item of visibleLeafs(sec.items); track item.path) {
                          <a [routerLink]="item.path"
                             routerLinkActive="bg-brand-primary/20 text-white border-brand-accent"
                             [routerLinkActiveOptions]="{ exact: false }"
                             class="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-neutral-400
                                    hover:bg-neutral-800 hover:text-white transition-colors
                                    border-l-2 border-transparent">
                            <span class="material-symbols-outlined text-[15px] shrink-0">{{ item.icon }}</span>
                            <span class="truncate">{{ item.label }}</span>
                          </a>
                        }
                      }
                    </div>
                  }

                }
              </div>
            }

          }
        }
      </nav>

      <!-- Usuario -->
      <div class="border-t border-neutral-700/60 shrink-0"
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
export class SidebarComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  protected readonly layout    = inject(LayoutService);
  private  readonly router     = inject(Router);

  private readonly expandedModulesSet  = signal<Set<string>>(new Set<string>());
  private readonly expandedSectionsMap = signal<Map<string, Set<string>>>(new Map<string, Set<string>>());

  private readonly navModules: NavModule[] = [
    {
      key: 'prestamos',
      label: 'Préstamos Intercompañía',
      icon: 'account_balance',
      subsections: [
        {
          key: 'configuraciones',
          label: 'Configuraciones',
          icon: 'settings',
          items: [
            { label: 'Empresas',      path: '/configuracion/empresas',     icon: 'domain',           roles: ['ADMIN'] },
            { label: 'Tasas',         path: '/configuracion/tasas-periodo', icon: 'percent',          roles: ['ADMIN', 'TESORERIA', 'APROBADOR'] },
            { label: 'Integraciones', path: '/integraciones/estado',        icon: 'settings_ethernet', roles: ['ADMIN'] },
          ],
        },
        {
          key: 'movimientos',
          label: 'Movimientos',
          icon: 'swap_horiz',
          items: [
            { label: 'Nueva operación',     path: '/operaciones/nueva',           icon: 'add_circle',  roles: ['ADMIN', 'TESORERIA'] },
            { label: 'Operaciones',         path: '/operaciones',                  icon: 'receipt_long', roles: ['ADMIN', 'TESORERIA', 'EMPRESA_RECEPTORA'] },
            { label: 'Pend. aprobación',    path: '/operaciones/aprobacion-interna', icon: 'task_alt',  roles: ['APROBADOR', 'ADMIN'] },
            { label: 'Bandeja empresa',     path: '/operaciones/aceptacion-empresa', icon: 'handshake', roles: ['EMPRESA_RECEPTORA', 'ADMIN'] },
            { label: 'Desembolsos',         path: '/operaciones/desembolsos',      icon: 'payments',    roles: ['ADMIN', 'TESORERIA'] },
            { label: 'Seguimiento',         path: '/operaciones/seguimiento',      icon: 'monitoring',  roles: ['ADMIN', 'TESORERIA', 'APROBADOR', 'CONTABILIDAD', 'CONSULTA'] },
            { label: 'Liquidación mensual', path: '/liquidaciones-mensuales',      icon: 'calculate',   roles: ['ADMIN', 'TESORERIA', 'APROBADOR', 'CONTABILIDAD'] },
            { label: 'Control GMF',         path: '/controles/gmf',               icon: 'receipt',     roles: ['ADMIN', 'TESORERIA', 'CONTABILIDAD'] },
            { label: 'Interés presunto',    path: '/controles/presunto',          icon: 'gavel',       roles: ['ADMIN', 'TESORERIA', 'CONTABILIDAD'] },
          ],
        },
        {
          key: 'consultas',
          label: 'Consultas',
          icon: 'manage_search',
          items: [
            { label: 'Cartera de operaciones',   path: '/dashboard/cartera',     icon: 'hub',        roles: ['ADMIN', 'TESORERIA', 'APROBADOR', 'CONTABILIDAD', 'CONSULTA'] },
            { label: 'Resumen financiero',        path: '/dashboard/resumen',     icon: 'summarize',  roles: ['ADMIN', 'TESORERIA', 'APROBADOR', 'CONTABILIDAD', 'CONSULTA'] },
            { label: 'Indicadores gerenciales',   path: '/dashboard/indicadores', icon: 'leaderboard', roles: ['ADMIN', 'TESORERIA', 'APROBADOR', 'CONTABILIDAD', 'CONSULTA'] },
          ],
        },
        {
          key: 'reportes',
          label: 'Reportes',
          icon: 'bar_chart',
          items: [
            { label: 'Reportes', path: '/dashboard/reportes', icon: 'assessment', roles: ['ADMIN', 'TESORERIA', 'CONTABILIDAD'] },
          ],
        },
      ],
    },
    {
      key: 'nuevo-modulo',
      label: 'Nuevo Módulo',
      icon: 'extension',
      subsections: [
        { key: 'configuraciones', label: 'Configuraciones', icon: 'settings',      items: [] },
        { key: 'movimientos',     label: 'Movimientos',     icon: 'swap_horiz',    items: [] },
        { key: 'consultas',       label: 'Consultas',       icon: 'manage_search', items: [] },
        { key: 'reportes',        label: 'Reportes',        icon: 'bar_chart',     items: [] },
      ],
    },
  ];

  ngOnInit(): void {
    this.updateExpansionFromRoute(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.updateExpansionFromRoute((e as NavigationEnd).urlAfterRedirects));
  }

  private updateExpansionFromRoute(url: string): void {
    for (const mod of this.navModules) {
      for (const sec of mod.subsections) {
        if (sec.items.some(item => url.startsWith(item.path))) {
          this.expandedModulesSet.update(s => new Set([...s, mod.key]));
          this.expandedSectionsMap.update(m => {
            const next = new Map(m);
            next.set(mod.key, new Set([...(next.get(mod.key) ?? []), sec.key]));
            return next;
          });
        }
      }
    }
  }

  protected openModule(key: string): void {
    if (this.layout.collapsed()) this.layout.toggle();
    this.expandedModulesSet.update(s => new Set([...s, key]));
  }

  protected toggleModule(key: string): void {
    this.expandedModulesSet.update(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  protected toggleSection(moduleKey: string, sectionKey: string): void {
    this.expandedSectionsMap.update(m => {
      const next    = new Map(m);
      const current = new Set(next.get(moduleKey) ?? []);
      if (current.has(sectionKey)) {
        current.delete(sectionKey);
      } else {
        current.clear();          // cierra todas las demás secciones del módulo
        current.add(sectionKey);
      }
      next.set(moduleKey, current);
      return next;
    });
  }

  protected isModuleExpanded(key: string): boolean {
    return this.expandedModulesSet().has(key);
  }

  protected isSectionExpanded(moduleKey: string, sectionKey: string): boolean {
    return this.expandedSectionsMap().get(moduleKey)?.has(sectionKey) ?? false;
  }

  protected visibleModules(): NavModule[] {
    const roles = this.authStore.userRoles();
    return this.navModules.filter(mod =>
      mod.subsections.every(s => s.items.length === 0) ||
      mod.subsections.some(s =>
        s.items.some(i => i.roles.length === 0 || i.roles.some(r => roles.includes(r)))
      )
    );
  }

  protected visibleSections(mod: NavModule): NavSubSection[] {
    const roles = this.authStore.userRoles();
    return mod.subsections.filter(sec =>
      sec.items.length === 0 ||
      sec.items.some(i => i.roles.length === 0 || i.roles.some(r => roles.includes(r)))
    );
  }

  protected visibleLeafs(items: NavLeaf[]): NavLeaf[] {
    const roles = this.authStore.userRoles();
    return items.filter(i => i.roles.length === 0 || i.roles.some(r => roles.includes(r)));
  }
}
