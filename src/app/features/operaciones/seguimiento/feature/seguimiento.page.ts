import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SeguimientoService } from '../data-access/seguimiento.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { OperacionListItem } from '../../domain/operacion.model';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [EmptyStateComponent, CurrencyCopPipe],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Seguimiento de operaciones</h1>
        <p class="text-sm text-neutral-500 mt-0.5">Operaciones desembolsadas activas (DS)</p>
      </div>

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Referencia</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Prestamista → Prestataria</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Interés</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Monto</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Días</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-28">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (loading()) {
                @for (i of [1,2,3]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6]; track j) {
                    <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                  }</tr>
                }
              } @else if (items().length === 0) {
                <tr><td colspan="6" class="py-0">
                  <app-empty-state icon="account_balance"
                                   title="Sin operaciones activas"
                                   description="No hay operaciones desembolsadas en seguimiento."/>
                </td></tr>
              } @else {
                @for (op of items(); track op.id) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-3 font-mono text-xs font-semibold text-brand-primary">
                      {{ op.referencia ?? '—' }}
                    </td>
                    <td class="px-4 py-3 text-neutral-700">
                      <span class="font-medium">{{ op.empresaPrestamistaNombre }}</span>
                      <span class="text-neutral-400 mx-1.5">→</span>
                      {{ op.empresaPrestatariaNombre }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded-full font-medium"
                            [class]="badgeClass(op.cobraInteres)">
                        {{ labelInteres(op.cobraInteres) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-neutral-900">
                      {{ op.montoEstimado ? (op.montoEstimado | currencyCop) : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center text-neutral-500">{{ op.diasEsperando }}d</td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="irADetalle(op.id)"
                              class="text-brand-primary hover:text-brand-primary/80 transition-colors">
                        <span class="material-symbols-outlined text-xl">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (error()) {
        <p class="text-sm text-red-600 text-center">{{ error() }}</p>
      }
    </div>
  `,
})
export class SeguimientoPage implements OnInit {
  private readonly svc    = inject(SeguimientoService);
  private readonly router = inject(Router);

  items   = signal<OperacionListItem[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  ngOnInit() {
    this.svc.listarVigentes().subscribe({
      next: d => { this.items.set(d); this.loading.set(false); },
      error: () => { this.error.set('Error cargando operaciones'); this.loading.set(false); },
    });
  }

  irADetalle(id: number) {
    this.router.navigate(['/operaciones/seguimiento', id]);
  }

  labelInteres(cobra: string): string {
    return { SI_COMERCIAL: 'Comercial', SI_ESPECIAL: 'Especial', NO: 'Sin interés' }[cobra] ?? cobra;
  }

  badgeClass(cobra: string): string {
    return {
      SI_COMERCIAL: 'bg-blue-100 text-blue-700',
      SI_ESPECIAL:  'bg-purple-100 text-purple-700',
      NO:           'bg-neutral-100 text-neutral-600',
    }[cobra] ?? 'bg-neutral-100 text-neutral-600';
  }
}
