import { Component, input } from '@angular/core';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { LiquidacionMensual } from '../domain/liquidacion.model';

@Component({
  selector: 'app-liquidacion-totales',
  standalone: true,
  imports: [CurrencyCopPipe],
  template: `
    @if (liq()) {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4 border-l-4 border-amber-500">
          <p class="text-xs text-neutral-500 mb-1">Total intereses</p>
          <p class="text-lg font-bold text-neutral-900">{{ liq()!.totalInteresesLiquidados | currencyCop }}</p>
        </div>
        <div class="card p-4 border-l-4 border-red-400">
          <p class="text-xs text-neutral-500 mb-1">Ret. en la fuente</p>
          <p class="text-lg font-bold text-neutral-900">{{ liq()!.totalRetencionFuente | currencyCop }}</p>
        </div>
        <div class="card p-4 border-l-4 border-orange-400">
          <p class="text-xs text-neutral-500 mb-1">Ret. ICA</p>
          <p class="text-lg font-bold text-neutral-900">{{ liq()!.totalRetencionIca | currencyCop }}</p>
        </div>
        <div class="card p-4 border-l-4 border-green-500">
          <p class="text-xs text-neutral-500 mb-1">Neto a cobrar</p>
          <p class="text-lg font-bold text-green-700">{{ liq()!.totalNetoCobrar | currencyCop }}</p>
        </div>
      </div>
    }
  `,
})
export class LiquidacionTotalesComponent {
  liq = input<LiquidacionMensual | null>(null);
}
