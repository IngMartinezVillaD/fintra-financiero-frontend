import { Component, input } from '@angular/core';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { PercentageEaPipe } from '@shared/pipes/percentage-ea.pipe';
import { Tramo, TIPO_MOVIMIENTO_LABEL } from '../domain/seguimiento.model';

@Component({
  selector: 'app-tramos-tabla',
  standalone: true,
  imports: [CurrencyCopPipe, PercentageEaPipe],
  template: `
    <div class="card p-0 overflow-hidden">
      <div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <h3 class="text-sm font-semibold text-neutral-700">Tabla de tramos</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-neutral-500">#</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-neutral-500">Tipo</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-neutral-500">Desde</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-neutral-500">Hasta</th>
              <th class="px-3 py-2 text-center text-xs font-medium text-neutral-500">Días</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-neutral-500">Capital</th>
              <th class="px-3 py-2 text-center text-xs font-medium text-neutral-500">Tasa EM</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-neutral-500">Interés</th>
              <th class="px-3 py-2 text-center text-xs font-medium text-neutral-500">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @if (tramos().length === 0) {
              <tr><td colspan="9" class="text-center py-6 text-neutral-400 text-sm">Sin tramos registrados</td></tr>
            }
            @for (t of tramos(); track t.id) {
              <tr [class]="t.estado === 'EN_CURSO' ? 'bg-blue-50' : 'hover:bg-neutral-50'">
                <td class="px-3 py-2 text-neutral-500">{{ t.numeroTramo }}</td>
                <td class="px-3 py-2">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="tipoClass(t.tipoMovimiento)">
                    {{ tipoLabel(t.tipoMovimiento) }}
                  </span>
                </td>
                <td class="px-3 py-2 text-neutral-700">{{ t.fechaDesde }}</td>
                <td class="px-3 py-2 text-neutral-700">{{ t.fechaHasta }}</td>
                <td class="px-3 py-2 text-center text-neutral-600">{{ t.dias }}</td>
                <td class="px-3 py-2 text-right font-medium text-neutral-900">{{ t.saldoCapital | currencyCop }}</td>
                <td class="px-3 py-2 text-center text-neutral-600">{{ t.tasaPorcentajeMensual }}%</td>
                <td class="px-3 py-2 text-right font-medium text-neutral-900">{{ t.interesCalculado | currencyCop }}</td>
                <td class="px-3 py-2 text-center">
                  @if (t.estado === 'EN_CURSO') {
                    <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">En curso</span>
                  } @else {
                    <span class="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">Liquidado</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TramosTablaCo {
  tramos = input<Tramo[]>([]);

  tipoLabel(tipo: string): string {
    return TIPO_MOVIMIENTO_LABEL[tipo] ?? tipo;
  }

  tipoClass(tipo: string): string {
    const m: Record<string, string> = {
      DESEMBOLSO_INICIAL:              'bg-green-100 text-green-700',
      LIQUIDACION_CIERRE_MES:          'bg-neutral-100 text-neutral-600',
      LIQUIDACION_PARCIAL_CAMBIO_TASA: 'bg-purple-100 text-purple-700',
      LIQUIDACION_NUEVO_DESEMBOLSO:    'bg-blue-100 text-blue-700',
      LIQUIDACION_POR_ABONO:           'bg-amber-100 text-amber-700',
    };
    return m[tipo] ?? 'bg-neutral-100 text-neutral-600';
  }
}
