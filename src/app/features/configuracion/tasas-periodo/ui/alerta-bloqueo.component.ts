import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BloqueoStore } from '@core/bloqueo/bloqueo.store';

@Component({
  selector: 'app-alerta-bloqueo',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (store.bloqueo()?.estado === 'BLOQUEADO_GLOBAL') {
      <div class="bg-danger text-white px-4 py-2.5 flex items-center gap-3 text-sm" role="alert">
        <span class="material-symbols-outlined text-base shrink-0">warning</span>
        <span class="flex-1 font-medium">{{ store.bloqueo()!.motivo }}</span>
        @if (store.bloqueo()!.ruta) {
          <a [routerLink]="store.bloqueo()!.ruta"
             class="shrink-0 underline hover:no-underline font-semibold">
            {{ store.bloqueo()!.rutaLabel ?? 'Registrar tasas' }}
          </a>
        }
      </div>
    }
  `,
})
export class AlertaBloqueoComponent implements OnInit, OnDestroy {
  protected readonly store = inject(BloqueoStore);
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.store.verificar();
    this.intervalId = setInterval(() => this.store.verificar(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
