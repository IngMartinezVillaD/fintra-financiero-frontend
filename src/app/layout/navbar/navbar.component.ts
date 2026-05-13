import { Component, inject } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';
import { NotificationStore } from '../../core/notifications/notification.store';
import { LayoutService } from '../layout.service';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [BreadcrumbsComponent],
  template: `
    <header class="bg-white border-b border-neutral-200 px-4 h-16 flex items-center justify-between shrink-0">
      <!-- Hamburguesa + Breadcrumbs -->
      <div class="flex items-center gap-3">
        <button (click)="layout.toggle()"
                class="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0"
                [attr.aria-label]="layout.collapsed() ? 'Expandir menú' : 'Colapsar menú'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="hidden sm:block">
          <app-breadcrumbs />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        @for (n of notifications.notifications(); track n.id) {
          <div class="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
            <div [class]="notifClass(n.severity)"
                 class="flex items-start gap-3 p-4 rounded-xl shadow-lg max-w-sm">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">{{ n.title }}</p>
                <p class="text-sm opacity-80 mt-0.5">{{ n.message }}</p>
                @if (n.traceId) {
                  <p class="text-xs opacity-60 mt-1 font-mono">ID: {{ n.traceId }}</p>
                }
              </div>
              <button (click)="notifications.dismiss(n.id)" class="text-current opacity-60 hover:opacity-100">✕</button>
            </div>
          </div>
        }

        <!-- User menu -->
        <div class="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
          <div class="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
            <span class="text-white text-sm font-medium">
              {{ authStore.user()?.nombre?.charAt(0) ?? 'U' }}
            </span>
          </div>
          <div class="hidden sm:flex flex-col min-w-0">
            <span class="text-sm font-medium text-neutral-700 truncate leading-tight">
              {{ authStore.user()?.nombre }}
            </span>
            <span class="text-xs text-neutral-400 truncate leading-tight">
              {{ authStore.user()?.roles?.join(', ') }}
            </span>
          </div>
          <button (click)="authStore.logout()"
                  title="Cerrar sesión"
                  class="p-1.5 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500
                         transition-colors shrink-0">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  protected readonly authStore     = inject(AuthStore);
  protected readonly notifications = inject(NotificationStore);
  protected readonly layout        = inject(LayoutService);

  protected notifClass(severity: string): string {
    const map: Record<string, string> = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-white',
      info: 'bg-info text-white',
    };
    return map[severity] ?? 'bg-neutral-800 text-white';
  }
}
