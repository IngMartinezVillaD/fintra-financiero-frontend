import { Component, input } from '@angular/core';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { ConsolidadoFinanciero } from '../domain/dashboard.model';

@Component({
  selector: 'app-consolidado-cards',
  standalone: true,
  imports: [CurrencyCopPipe],
  template: `
    @if (consolidado()) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Derechos crediticios -->
        <div class="card p-5 border-l-4 border-green-500">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-green-500">trending_up</span>
            <p class="text-sm font-semibold text-neutral-600">Derechos crediticios</p>
          </div>
          <p class="text-2xl font-bold text-green-700">
            {{ consolidado()!.derechosTotal | currencyCop }}
          </p>
          <p class="text-xs text-neutral-400 mt-1">Fintra como prestamista</p>
          <div class="mt-3 pt-3 border-t border-neutral-100 space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-neutral-500">Capital</span>
              <span class="font-medium">{{ consolidado()!.derechosSaldoCapital | currencyCop }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">Intereses</span>
              <span class="font-medium">{{ consolidado()!.derechosIntereses | currencyCop }}</span>
            </div>
          </div>
        </div>

        <!-- Obligaciones financieras -->
        <div class="card p-5 border-l-4 border-red-400">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-red-400">trending_down</span>
            <p class="text-sm font-semibold text-neutral-600">Obligaciones financieras</p>
          </div>
          <p class="text-2xl font-bold text-red-600">
            {{ consolidado()!.obligacionesTotal | currencyCop }}
          </p>
          <p class="text-xs text-neutral-400 mt-1">Fintra como prestataria</p>
          <div class="mt-3 pt-3 border-t border-neutral-100 space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-neutral-500">Capital</span>
              <span class="font-medium">{{ consolidado()!.obligacionesSaldoCapital | currencyCop }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">Intereses</span>
              <span class="font-medium">{{ consolidado()!.obligacionesIntereses | currencyCop }}</span>
            </div>
          </div>
        </div>

        <!-- Exposición neta -->
        <div class="card p-5 border-l-4 border-blue-500">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-blue-500">balance</span>
            <p class="text-sm font-semibold text-neutral-600">Exposición neta</p>
          </div>
          <p class="text-3xl font-bold text-blue-700">
            {{ consolidado()!.exposicionNeta | currencyCop }}
          </p>
          <p class="text-xs text-neutral-400 mt-1">
            Derechos − Obligaciones · {{ consolidado()!.totalOperacionesDs }} ops DS
          </p>
        </div>
      </div>
    }
  `,
})
export class ConsolidadoCardsComponent {
  consolidado = input<ConsolidadoFinanciero | null>(null);
}
