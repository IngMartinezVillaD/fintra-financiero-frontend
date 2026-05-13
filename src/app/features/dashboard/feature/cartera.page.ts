import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DashboardService } from '../data-access/dashboard.service';
import { PipelineStepperLargeComponent } from '../ui/pipeline-stepper-large.component';
import { ConsolidadoCardsComponent } from '../ui/consolidado-cards.component';
import { DashboardData } from '../domain/dashboard.model';

@Component({
  selector: 'app-cartera',
  standalone: true,
  imports: [PipelineStepperLargeComponent, ConsolidadoCardsComponent],
  template: `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Cartera de operaciones</h1>
          <p class="text-xs text-neutral-400 mt-0.5">
            Última actualización: {{ ultimaActualizacion() }}
            <button (click)="cargar()" class="ml-2 text-brand-primary hover:underline">↻ Actualizar</button>
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="card p-4 h-20 bg-neutral-100 animate-pulse rounded-xl"></div>
          }
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5 h-32 bg-neutral-100 animate-pulse rounded-xl"></div>
          }
        </div>
      } @else if (data()) {
        <app-pipeline-stepper-large [conteo]="data()!.pipeline" />
        <app-consolidado-cards [consolidado]="data()!.consolidado" />
      }
    </div>
  `,
})
export class CarteraPage implements OnInit, OnDestroy {
  private readonly svc = inject(DashboardService);

  data                = signal<DashboardData | null>(null);
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
  }
}
