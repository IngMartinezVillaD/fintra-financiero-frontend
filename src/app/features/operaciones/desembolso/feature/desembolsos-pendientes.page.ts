import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DesembolsoService } from '../data-access/desembolso.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { OperacionListItem } from '../../domain/operacion.model';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-desembolsos-pendientes',
  standalone: true,
  imports: [EmptyStateComponent, CurrencyCopPipe],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Desembolsos pendientes</h1>
        <p class="text-sm text-neutral-500 mt-0.5">
          Operaciones con firma completada, listas para desembolsar (FD → DS)
        </p>
      </div>

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Referencia</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Prestamista → Prestataria</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Monto Est.</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Interés</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Días en FD</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-28">Acción</th>
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
                  <app-empty-state
                    icon="payments"
                    title="Sin operaciones pendientes"
                    description="No hay operaciones con firma completada esperando desembolso."/>
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
                      <span>{{ op.empresaPrestatariaNombre }}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-neutral-900">
                      {{ op.montoEstimado ? (op.montoEstimado | currencyCop) : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded-full font-medium"
                            [class]="badgeClass(op.cobraInteres)">
                        {{ labelInteres(op.cobraInteres) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center text-neutral-500">
                      {{ op.diasEsperando }}d
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        (click)="irAConfirmar(op.id)"
                        class="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md
                               bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-medium">
                        <span class="material-symbols-outlined text-sm">payments</span>
                        Desembolsar
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
export class DesembolsosPendientesPage implements OnInit {
  private readonly svc    = inject(DesembolsoService);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);

  items   = signal<OperacionListItem[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  ngOnInit() {
    this.svc.pendientes().subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('No se pudieron cargar los pendientes'); this.loading.set(false); this.toast.error('No se pudieron cargar los pendientes'); },
    });
  }

  irAConfirmar(id: number) {
    this.router.navigate(['/operaciones/desembolsos', id, 'confirmar']);
  }

  labelInteres(cobra: string): string {
    const m: Record<string, string> = {
      SI_COMERCIAL: 'Comercial', SI_ESPECIAL: 'Especial', NO: 'Sin interés',
    };
    return m[cobra] ?? cobra;
  }

  badgeClass(cobra: string): string {
    const m: Record<string, string> = {
      SI_COMERCIAL: 'bg-blue-100 text-blue-700',
      SI_ESPECIAL:  'bg-purple-100 text-purple-700',
      NO:           'bg-neutral-100 text-neutral-600',
    };
    return m[cobra] ?? 'bg-neutral-100 text-neutral-600';
  }
}
