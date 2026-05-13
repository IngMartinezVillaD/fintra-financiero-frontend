import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../data-access/dashboard.service';
import { KpiGerencial } from '../domain/dashboard.model';

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Indicadores gerenciales</h1>
        <p class="text-xs text-neutral-400 mt-0.5">
          Última actualización: {{ ultimaActualizacion() }}
          <button (click)="cargar()" class="ml-2 text-brand-primary hover:underline">↻ Actualizar</button>
        </p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-5 h-28 bg-neutral-100 animate-pulse rounded-xl"></div>
          }
        </div>
      } @else if (kpis()) {
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
      } @else {
        <p class="text-sm text-neutral-400">Sin datos de indicadores disponibles.</p>
      }
    </div>
  `,
})
export class IndicadoresPage implements OnInit, OnDestroy {
  private readonly svc = inject(DashboardService);

  kpis                = signal<KpiGerencial | null>(null);
  loading             = signal(true);
  ultimaActualizacion = signal('—');

  private interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.cargar();
    this.interval = setInterval(() => this.cargar(), 60_000);
  }

  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }

  cargar(): void {
    this.svc.kpis().subscribe({
      next: k => {
        this.kpis.set(k);
        this.loading.set(false);
        this.ultimaActualizacion.set(new Date().toLocaleTimeString('es-CO'));
      },
      error: () => this.loading.set(false),
    });
  }
}
