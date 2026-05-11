import { Component, input } from '@angular/core';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { SaldosSeparados } from '../domain/seguimiento.model';

@Component({
  selector: 'app-saldos-separados',
  standalone: true,
  imports: [CurrencyCopPipe],
  template: `
    @if (saldos()) {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4 border-l-4 border-blue-500">
          <p class="text-xs text-neutral-500 mb-1">Saldo capital</p>
          <p class="text-lg font-bold text-neutral-900">{{ saldos()!.saldoCapital | currencyCop }}</p>
        </div>
        <div class="card p-4 border-l-4 border-amber-500">
          <p class="text-xs text-neutral-500 mb-1">Intereses causados</p>
          <p class="text-lg font-bold text-neutral-900">{{ saldos()!.interesesCausados | currencyCop }}</p>
          <p class="text-xs text-neutral-400 mt-1">Pendientes de cobro</p>
        </div>
        <div class="card p-4 border-l-4 border-purple-500">
          <p class="text-xs text-neutral-500 mb-1">Interés en curso</p>
          <p class="text-lg font-bold text-neutral-900">{{ saldos()!.interesEnCurso | currencyCop }}</p>
          <p class="text-xs text-neutral-400 mt-1">Tramo activo al día</p>
        </div>
        <div class="card p-4 border-l-4 border-neutral-400">
          <p class="text-xs text-neutral-500 mb-1">GMF incurrido</p>
          <p class="text-lg font-bold text-neutral-900">{{ saldos()!.gmfIncurrido | currencyCop }}</p>
          <p class="text-xs text-neutral-400 mt-1">Extracontable</p>
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <div class="text-sm text-neutral-600">
          Deuda total:
          <span class="font-bold text-neutral-900 ml-1">{{ saldos()!.deudaTotal | currencyCop }}</span>
        </div>
      </div>
    }
  `,
})
export class SaldosSeparadosComponent {
  saldos = input<SaldosSeparados | null>(null);
}
