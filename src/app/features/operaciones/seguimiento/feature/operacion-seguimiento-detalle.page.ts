import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeguimientoService } from '../data-access/seguimiento.service';
import { SaldosSeparadosComponent } from '../ui/saldos-separados.component';
import { TramosTablaCo } from '../ui/tramos-tabla.component';
import { RegistrarAbonoDialog } from './registrar-abono.dialog';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { RegistrarAbonoResponse, SeguimientoOperacion } from '../domain/seguimiento.model';

@Component({
  selector: 'app-operacion-seguimiento-detalle',
  standalone: true,
  imports: [
    SaldosSeparadosComponent, TramosTablaCo, RegistrarAbonoDialog,
    CurrencyCopPipe, HasRoleDirective,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <button (click)="router.navigate(['/operaciones/seguimiento'])"
                class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            @if (detalle()) {
              <h1 class="text-xl font-bold text-neutral-900 font-mono">{{ detalle()!.referencia }}</h1>
              <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">DS</span>
            } @else {
              <div class="h-7 w-40 bg-neutral-200 rounded animate-pulse"></div>
            }
          </div>
          @if (detalle()) {
            <p class="text-sm text-neutral-500 mt-0.5">
              {{ detalle()!.empresaPrestamistaNombre }} → {{ detalle()!.empresaPrestatariaNombre }}
            </p>
          }
        </div>
        <div *hasRole="['ADMIN','TESORERIA']">
          <button (click)="abrirAbono = true"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white
                         text-sm font-medium hover:bg-brand-primary/90 transition-colors">
            <span class="material-symbols-outlined text-sm">payments</span>
            Registrar abono
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2]; track i) {
            <div class="card p-4 space-y-2">
              @for (j of [1,2,3,4]; track j) {
                <div class="h-5 bg-neutral-200 rounded animate-pulse"></div>
              }
            </div>
          }
        </div>
      } @else if (detalle()) {
        <!-- Info desembolso -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="card p-3">
            <p class="text-xs text-neutral-500 mb-1">Fecha desembolso</p>
            <p class="font-medium text-neutral-900">{{ detalle()!.fechaDesembolso ?? '—' }}</p>
          </div>
          <div class="card p-3">
            <p class="text-xs text-neutral-500 mb-1">Monto desembolsado</p>
            <p class="font-medium text-neutral-900">
              {{ detalle()!.montoDesembolsado ? (detalle()!.montoDesembolsado! | currencyCop) : '—' }}
            </p>
          </div>
          <div class="card p-3">
            <p class="text-xs text-neutral-500 mb-1">Tipo de interés</p>
            <p class="font-medium text-neutral-900">{{ labelInteres(detalle()!.cobraInteres) }}</p>
          </div>
          <div class="card p-3">
            <p class="text-xs text-neutral-500 mb-1">Abonos realizados</p>
            <p class="font-medium text-neutral-900">{{ detalle()!.abonos.length }}</p>
          </div>
        </div>

        <!-- Saldos separados -->
        <app-saldos-separados [saldos]="detalle()!.saldos" />

        <!-- Tramos -->
        <app-tramos-tabla [tramos]="detalle()!.tramos" />

        <!-- Historial de abonos -->
        @if (detalle()!.abonos.length > 0) {
          <div class="card p-0 overflow-hidden">
            <div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <h3 class="text-sm font-semibold text-neutral-700">Historial de abonos</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Fecha</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">Total</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">A intereses</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">A capital</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Comprobante</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Observaciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                  @for (a of detalle()!.abonos; track a.id) {
                    <tr class="hover:bg-neutral-50">
                      <td class="px-4 py-2 text-neutral-700">{{ a.fecha }}</td>
                      <td class="px-4 py-2 text-right font-medium text-neutral-900">{{ a.montoTotal | currencyCop }}</td>
                      <td class="px-4 py-2 text-right text-amber-700">{{ a.aplicadoAIntereses | currencyCop }}</td>
                      <td class="px-4 py-2 text-right text-blue-700">{{ a.aplicadoACapital | currencyCop }}</td>
                      <td class="px-4 py-2 text-neutral-600 font-mono text-xs">{{ a.numeroComprobante }}</td>
                      <td class="px-4 py-2 text-neutral-500">{{ a.observaciones ?? '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      } @else if (!loading()) {
        <p class="text-center text-neutral-500 py-12">Operación no encontrada.</p>
      }
    </div>

    <app-registrar-abono-dialog
      [open]="abrirAbono"
      [operacionId]="operacionId"
      (cerrar)="abrirAbono = false"
      (registrado)="onAbonoRegistrado($event)" />
  `,
})
export class OperacionSeguimientoDetallePage implements OnInit {
  readonly router        = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(SeguimientoService);

  operacionId = 0;
  detalle     = signal<SeguimientoOperacion | null>(null);
  loading     = signal(true);
  abrirAbono  = false;

  ngOnInit() {
    this.operacionId = +this.route.snapshot.paramMap.get('id')!;
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.svc.obtener(this.operacionId).subscribe({
      next: d => { this.detalle.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onAbonoRegistrado(res: RegistrarAbonoResponse) {
    this.abrirAbono = false;
    this.cargar();
  }

  labelInteres(cobra: string): string {
    return { SI_COMERCIAL: 'Tasa comercial', SI_ESPECIAL: 'Tasa especial', NO: 'Sin interés' }[cobra] ?? cobra;
  }
}
