import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../data-access/dashboard.service';
import { PipelineStepperLargeComponent } from '../ui/pipeline-stepper-large.component';
import { ConsolidadoCardsComponent } from '../ui/consolidado-cards.component';
import { AlertasListComponent } from '../ui/alertas-list.component';
import { EvolucionChartComponent } from '../ui/evolucion-chart.component';
import { DashboardData, EvolucionMensual, KpiGerencial } from '../domain/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    PipelineStepperLargeComponent, ConsolidadoCardsComponent,
    AlertasListComponent, EvolucionChartComponent,
  ],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Dashboard Financiero</h1>
          <p class="text-xs text-neutral-400 mt-0.5">
            Última actualización: {{ ultimaActualizacion() }}
            <button (click)="cargar()" class="ml-2 text-brand-primary hover:underline">↻ Actualizar</button>
          </p>
        </div>
      </div>

      @if (loading()) {
        <!-- Skeleton -->
        <div class="grid grid-cols-5 gap-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="card p-4 h-20 bg-neutral-100 animate-pulse rounded-xl"></div>
          }
        </div>
        <div class="grid grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5 h-32 bg-neutral-100 animate-pulse rounded-xl"></div>
          }
        </div>
      } @else if (data()) {
        <!-- Pipeline -->
        <app-pipeline-stepper-large [conteo]="data()!.pipeline" />

        <!-- Consolidado -->
        <app-consolidado-cards [consolidado]="data()!.consolidado" />

        <!-- Tasas vigentes + Alertas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tasas vigentes -->
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

          <!-- Alertas -->
          <app-alertas-list [alertas]="data()!.alertas" />
        </div>

        <!-- Evolución mensual -->
        <app-evolucion-chart [datos]="evolucion()" />

        <!-- KPIs -->
        @if (kpis()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="card p-4 text-center">
              <p class="text-xs text-neutral-500 mb-1">Días prom. aprobación</p>
              <p class="text-2xl font-bold text-neutral-900">{{ kpis()!.diasPromedioAprobacion | number:'1.1-1' }}</p>
              <p class="text-xs text-neutral-400">CR → DS</p>
            </div>
            <div class="card p-4 text-center">
              <p class="text-xs text-neutral-500 mb-1">Operaciones activas</p>
              <p class="text-2xl font-bold text-green-700">{{ kpis()!.operacionesActivas }}</p>
              <p class="text-xs text-neutral-400">Estado DS</p>
            </div>
            <div class="card p-4 text-center">
              <p class="text-xs text-neutral-500 mb-1">En trámite</p>
              <p class="text-2xl font-bold text-blue-700">{{ kpis()!.operacionesEnTramite }}</p>
              <p class="text-xs text-neutral-400">CR a FD</p>
            </div>
            <div class="card p-4 text-center">
              <p class="text-xs text-neutral-500 mb-1">Tasa prom. ponderada</p>
              <p class="text-2xl font-bold text-amber-700">{{ kpis()!.tasaPromedioPonderada }}%</p>
              <p class="text-xs text-neutral-400">EM</p>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly svc = inject(DashboardService);

  data               = signal<DashboardData | null>(null);
  evolucion          = signal<EvolucionMensual[]>([]);
  kpis               = signal<KpiGerencial | null>(null);
  loading            = signal(true);
  ultimaActualizacion = signal('—');

  private interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.cargar();
    this.interval = setInterval(() => this.cargar(), 60_000);
  }

  ngOnDestroy() { if (this.interval) clearInterval(this.interval); }

  cargar() {
    this.svc.dashboard().subscribe({
      next: d => {
        this.data.set(d);
        this.loading.set(false);
        this.ultimaActualizacion.set(new Date().toLocaleTimeString('es-CO'));
      },
      error: () => this.loading.set(false),
    });

    const hasta = (new Date().toISOString().split('T')[0]) as string;
    const desde = (new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0]) as string;
    this.svc.evolucion(desde, hasta).subscribe({ next: d => this.evolucion.set(d) });
    this.svc.kpis().subscribe({ next: k => this.kpis.set(k) });
  }
}
