import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DashboardService } from '../data-access/dashboard.service';
import { AlertasListComponent } from '../ui/alertas-list.component';
import { EvolucionChartComponent } from '../ui/evolucion-chart.component';
import { DashboardData, EvolucionMensual } from '../domain/dashboard.model';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [AlertasListComponent, EvolucionChartComponent],
  template: `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Resumen financiero</h1>
          <p class="text-xs text-neutral-400 mt-0.5">
            Última actualización: {{ ultimaActualizacion() }}
            <button (click)="cargar()" class="ml-2 text-brand-primary hover:underline">↻ Actualizar</button>
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (i of [1,2]; track i) {
            <div class="card p-5 h-40 bg-neutral-100 animate-pulse rounded-xl"></div>
          }
        </div>
        <div class="card p-5 h-48 bg-neutral-100 animate-pulse rounded-xl"></div>
      } @else if (data()) {
        <!-- Tasas vigentes + Alertas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card p-4">
            <h3 class="text-sm font-semibold text-neutral-600 mb-3">Tasas vigentes hoy</h3>
            @if (data()!.tasasVigentes.length === 0) {
              <p class="text-sm text-neutral-400">Sin tasas vigentes</p>
            } @else {
              <div class="space-y-2">
                @for (t of data()!.tasasVigentes; track t.tipoTasa) {
                  <div class="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                    <div>
                      <p class="text-xs font-semibold text-neutral-600">{{ t.tipoTasa }}</p>
                      <p class="text-xs text-neutral-400">Hasta {{ t.vigenciaHasta }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-base font-bold text-neutral-900">{{ t.porcentajeEfectivoAnual }}% EA</p>
                      <p class="text-xs text-neutral-400">{{ t.porcentajeMensual }}% EM</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
          <app-alertas-list [alertas]="data()!.alertas" />
        </div>

        <!-- Evolución mensual -->
        <app-evolucion-chart [datos]="evolucion()" />
      }
    </div>
  `,
})
export class ResumenPage implements OnInit, OnDestroy {
  private readonly svc = inject(DashboardService);

  data                = signal<DashboardData | null>(null);
  evolucion           = signal<EvolucionMensual[]>([]);
  loading             = signal(true);
  ultimaActualizacion = signal('—');

  private interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.cargar();
    this.interval = setInterval(() => this.cargar(), 60_000);
  }

  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }

  cargar(): void {
    this.svc.dashboard().subscribe({
      next: d => {
        this.data.set(d);
        this.loading.set(false);
        this.ultimaActualizacion.set(new Date().toLocaleTimeString('es-CO'));
      },
      error: () => this.loading.set(false),
    });

    const hasta = new Date().toISOString().split('T')[0] as string;
    const desde = new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0] as string;
    this.svc.evolucion(desde, hasta).subscribe({ next: d => this.evolucion.set(d) });
  }
}
