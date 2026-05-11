import { Component, computed, input } from '@angular/core';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { EvolucionMensual } from '../domain/dashboard.model';

@Component({
  selector: 'app-evolucion-chart',
  standalone: true,
  imports: [CurrencyCopPipe],
  template: `
    <div class="card p-4">
      <h3 class="text-sm font-semibold text-neutral-600 mb-4">Evolución mensual</h3>

      @if (datos().length === 0) {
        <p class="text-sm text-neutral-400 text-center py-8">Sin datos para el período</p>
      } @else {
        <!-- Mini sparkline SVG -->
        <div class="overflow-x-auto">
          <div class="flex items-end gap-1 h-24 min-w-max px-2">
            @for (d of datos(); track d.periodo) {
              <div class="flex flex-col items-center gap-1" style="min-width: 48px">
                <div class="w-8 rounded-t transition-all"
                     [style.height.px]="barHeight(d)"
                     [class]="'bg-blue-400 hover:bg-blue-500'"
                     [title]="d.periodo + ': ' + d.saldoCapital">
                </div>
                <span class="text-xs text-neutral-400 writing-mode-vertical">{{ d.periodo }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Tabla resumen -->
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-neutral-200">
                <th class="text-left py-1 text-neutral-500">Período</th>
                <th class="text-right py-1 text-neutral-500">Saldo capital</th>
                <th class="text-right py-1 text-neutral-500">Intereses liq.</th>
                <th class="text-right py-1 text-neutral-500">GMF</th>
              </tr>
            </thead>
            <tbody>
              @for (d of datos(); track d.periodo) {
                <tr class="border-b border-neutral-50 hover:bg-neutral-50">
                  <td class="py-1 capitalize text-neutral-700">{{ d.periodo }}</td>
                  <td class="py-1 text-right font-medium text-neutral-900">{{ d.saldoCapital | currencyCop }}</td>
                  <td class="py-1 text-right text-amber-600">{{ d.interesesLiquidados | currencyCop }}</td>
                  <td class="py-1 text-right text-neutral-400">{{ d.gmfAcumulado | currencyCop }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class EvolucionChartComponent {
  datos = input<EvolucionMensual[]>([]);

  private maxSaldo = computed(() => {
    const vals = this.datos().map(d => parseFloat(d.saldoCapital) || 0);
    return Math.max(...vals, 1);
  });

  barHeight(d: EvolucionMensual): number {
    const val = parseFloat(d.saldoCapital) || 0;
    return Math.max(4, Math.round((val / this.maxSaldo()) * 80));
  }
}
