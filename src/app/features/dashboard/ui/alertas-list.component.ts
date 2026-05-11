import { Component, input } from '@angular/core';
import { Alerta } from '../domain/dashboard.model';

@Component({
  selector: 'app-alertas-list',
  standalone: true,
  template: `
    @if (alertas().length > 0) {
      <div class="card p-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-amber-500">warning</span>
          <h3 class="text-sm font-semibold text-neutral-700">
            Alertas ({{ alertas().length }})
          </h3>
        </div>
        <div class="space-y-2">
          @for (a of alertas(); track $index) {
            <div class="flex items-start gap-3 rounded-lg p-3"
                 [class]="a.diasRestantes <= 1 ? 'bg-red-50 border border-red-200' :
                           a.diasRestantes <= 2 ? 'bg-amber-50 border border-amber-200' :
                                                   'bg-yellow-50 border border-yellow-200'">
              <span class="material-symbols-outlined text-base mt-0.5"
                    [class]="a.diasRestantes <= 1 ? 'text-red-500' : 'text-amber-500'">
                schedule
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-800">
                  @if (a.tipo === 'ESPECIAL') {
                    Tasa especial
                    @if (a.empresaRazonSocial) { — {{ a.empresaRazonSocial }} }
                  } @else {
                    Tasa {{ a.subtipo }}
                  }
                </p>
                <p class="text-xs text-neutral-500 mt-0.5">
                  Vence {{ a.fechaVigenciaHasta }}
                  <span class="font-semibold ml-1"
                        [class]="a.diasRestantes <= 1 ? 'text-red-600' : 'text-amber-600'">
                    ({{ a.diasRestantes }}d restantes)
                  </span>
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class AlertasListComponent {
  alertas = input<Alerta[]>([]);
}
