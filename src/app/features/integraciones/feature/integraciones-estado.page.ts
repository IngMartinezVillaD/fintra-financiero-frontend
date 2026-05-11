import { Component, inject, OnInit, signal } from '@angular/core';
import { IntegracionesService } from '../data-access/integraciones.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import {
  IntegracionEstado, NotificacionHistorial,
  ESTADO_COLOR, ESTADO_ICON
} from '../domain/integraciones.model';

@Component({
  selector: 'app-integraciones-estado',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Estado de integraciones</h1>
        <p class="text-sm text-neutral-500 mt-0.5">Solo visible para ADMIN</p>
      </div>

      <!-- Cards de estado -->
      @if (loadingEstado()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-5 space-y-3">
              <div class="h-5 bg-neutral-200 rounded animate-pulse w-2/3"></div>
              <div class="h-8 bg-neutral-200 rounded animate-pulse"></div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (integ of estado(); track integ.nombre) {
            <div class="card p-5 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-neutral-700">{{ integ.nombre }}</p>
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                      [class]="estadoColor(integ.estado)">
                  {{ integ.estado }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-3xl"
                      [class]="iconColor(integ.estado)">
                  {{ estadoIcon(integ.estado) }}
                </span>
                <div class="text-sm space-y-0.5">
                  <p class="text-green-700 font-medium">✓ {{ integ.enviosExitosos24h }} enviados</p>
                  @if (integ.errores24h > 0) {
                    <p class="text-red-600 font-medium">✗ {{ integ.errores24h }} errores</p>
                  }
                </div>
              </div>
              @if (integ.ultimoMensaje) {
                <p class="text-xs text-neutral-400">{{ integ.ultimoMensaje }}</p>
              }
            </div>
          }
        </div>
      }

      <!-- Historial Bitrix24 -->
      <div class="card p-0 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <h3 class="text-sm font-semibold text-neutral-700">Historial notificaciones Bitrix24</h3>
          <button (click)="cargarHistorial()"
                  class="text-xs text-brand-primary hover:underline">Actualizar</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Evento</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-neutral-500">Estado</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-neutral-500">Reintentos</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Error</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Fecha</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-neutral-500 w-20">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (loadingHistorial()) {
                @for (i of [1,2,3]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6]; track j) {
                    <td class="px-4 py-2"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                  }</tr>
                }
              } @else if (historial().length === 0) {
                <tr><td colspan="6" class="py-8 text-center text-neutral-400 text-sm">
                  Sin notificaciones registradas
                </td></tr>
              } @else {
                @for (n of historial(); track n.id) {
                  <tr class="hover:bg-neutral-50">
                    <td class="px-4 py-2 text-xs font-mono text-neutral-700">{{ n.eventoCodigo }}</td>
                    <td class="px-4 py-2 text-center">
                      <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                            [class]="notifColor(n.estado)">{{ n.estado }}</span>
                    </td>
                    <td class="px-4 py-2 text-center text-neutral-500">{{ n.reintentos }}</td>
                    <td class="px-4 py-2 text-xs text-red-600 truncate max-w-xs">
                      {{ n.ultimoError ?? '—' }}
                    </td>
                    <td class="px-4 py-2 text-xs text-neutral-500">{{ n.createdAt | slice:0:19 }}</td>
                    <td class="px-4 py-2 text-center">
                      @if (n.estado === 'ERROR') {
                        <button (click)="reenviar(n.id)"
                                class="text-xs text-amber-600 hover:text-amber-800">
                          Reenviar
                        </button>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class IntegracionesEstadoPage implements OnInit {
  private readonly svc = inject(IntegracionesService);

  estado          = signal<IntegracionEstado[]>([]);
  historial       = signal<NotificacionHistorial[]>([]);
  loadingEstado   = signal(true);
  loadingHistorial = signal(true);

  ngOnInit() {
    this.cargarEstado();
    this.cargarHistorial();
  }

  cargarEstado() {
    this.loadingEstado.set(true);
    this.svc.estado().subscribe({
      next: d => { this.estado.set(d); this.loadingEstado.set(false); },
      error: () => this.loadingEstado.set(false),
    });
  }

  cargarHistorial() {
    this.loadingHistorial.set(true);
    this.svc.historialBitrix24().subscribe({
      next: d => { this.historial.set(d); this.loadingHistorial.set(false); },
      error: () => this.loadingHistorial.set(false),
    });
  }

  reenviar(id: number) {
    this.svc.reenviar(id).subscribe({ next: () => this.cargarHistorial() });
  }

  estadoColor(e: string): string { return (ESTADO_COLOR as Record<string, string>)[e] ?? ''; }
  estadoIcon(e: string): string  { return (ESTADO_ICON  as Record<string, string>)[e] ?? 'help'; }
  iconColor(e: string): string {
    const m: Record<string, string> = {
      OK: 'text-green-500', DEGRADADO: 'text-amber-500',
      CAIDO: 'text-red-500', DESACTIVADO: 'text-neutral-400',
    };
    return m[e] ?? '';
  }
  notifColor(e: string): string {
    const m: Record<string, string> = {
      PENDIENTE: 'bg-neutral-100 text-neutral-500',
      ENVIADA:   'bg-green-100 text-green-700',
      ERROR:     'bg-red-100 text-red-700',
    };
    return m[e] ?? '';
  }
}
