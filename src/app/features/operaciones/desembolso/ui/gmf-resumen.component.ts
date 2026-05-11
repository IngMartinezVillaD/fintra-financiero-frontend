import { Component, input } from '@angular/core';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { GmfResumen } from '../domain/desembolso.model';

@Component({
  selector: 'app-gmf-resumen',
  standalone: true,
  imports: [CurrencyCopPipe],
  template: `
    @if (gmf()) {
      <div [class]="gmf()!.aplica
            ? 'rounded-lg border border-amber-200 bg-amber-50 p-4'
            : 'rounded-lg border border-green-200 bg-green-50 p-4'">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-xl"
                [class]="gmf()!.aplica ? 'text-amber-600' : 'text-green-600'">
            {{ gmf()!.aplica ? 'warning' : 'verified' }}
          </span>
          <div>
            <p class="text-sm font-semibold"
               [class]="gmf()!.aplica ? 'text-amber-800' : 'text-green-800'">
              {{ gmf()!.aplica ? 'Aplica GMF (4×1000)' : 'Cuenta exenta de GMF' }}
            </p>
            @if (gmf()!.aplica) {
              <p class="text-sm text-amber-700 mt-0.5">
                GMF estimado: <strong>{{ gmf()!.monto | currencyCop }}</strong>
              </p>
            } @else {
              <p class="text-sm text-green-700 mt-0.5">{{ gmf()!.motivoExencion }}</p>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class GmfResumenComponent {
  gmf = input<GmfResumen | null>(null);
}
