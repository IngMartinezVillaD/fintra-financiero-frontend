import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LiquidacionService } from '../data-access/liquidacion.service';
import { LiquidacionTotalesComponent } from '../ui/totales-resumen.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import {
  LiquidacionMensual, LIQUIDACION_ESTADO_COLOR, LIQUIDACION_ESTADO_LABEL
} from '../domain/liquidacion.model';

@Component({
  selector: 'app-liquidacion-detalle',
  standalone: true,
  imports: [
    DatePipe, LiquidacionTotalesComponent, CurrencyCopPipe,
    HasRoleDirective, ButtonComponent, ConfirmDialogComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <button (click)="router.navigate(['/liquidaciones-mensuales'])"
                class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            @if (liq()) {
              <h1 class="text-xl font-bold text-neutral-900 capitalize">
                Liquidación {{ liq()!.periodo }}
              </h1>
              <span class="text-xs px-2 py-1 rounded-full font-medium"
                    [class]="estadoColor(liq()!.estado)">
                {{ estadoLabel(liq()!.estado) }}
              </span>
            } @else {
              <div class="h-7 w-48 bg-neutral-200 rounded animate-pulse"></div>
            }
          </div>
          @if (liq()) {
            <p class="text-sm text-neutral-500 mt-0.5">Fecha corte: {{ liq()!.fechaCorte }}</p>
          }
        </div>

        <!-- Acciones por estado -->
        @if (liq()) {
          <div class="flex items-center gap-2">
            @if (liq()!.estado === 'BORRADOR') {
              <app-button *hasRole="['ADMIN','TESORERIA']" [loading]="saving()" (clicked)="calcular()">
                <span class="material-symbols-outlined text-sm mr-1">calculate</span>
                Calcular
              </app-button>
            }
            @if (liq()!.estado === 'PENDIENTE_APROBACION') {
              <app-button *hasRole="['ADMIN','TESORERIA']" (clicked)="confirmarRevertir = true"
                          class="variant-outline">
                Revertir
              </app-button>
              <app-button *hasRole="['ADMIN','APROBADOR']" [loading]="saving()" (clicked)="confirmarAprobar = true">
                <span class="material-symbols-outlined text-sm mr-1">check_circle</span>
                Aprobar
              </app-button>
            }
            @if (liq()!.estado === 'APROBADA') {
              <app-button *hasRole="['ADMIN','TESORERIA']" [loading]="saving()" (clicked)="marcarContabilizada()">
                Marcar contabilizada
              </app-button>
            }
          </div>
        }
      </div>

      @if (loading()) {
        <div class="card p-6 space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="h-5 bg-neutral-200 rounded animate-pulse"></div>
          }
        </div>
      } @else if (liq()) {

        <!-- Totales -->
        <app-liquidacion-totales [liq]="liq()" />

        <!-- Estado EN_CALCULO -->
        @if (liq()!.estado === 'BORRADOR' && liq()!.totalInteresesLiquidados === '0') {
          <div class="card p-6 text-center text-neutral-400">
            <span class="material-symbols-outlined text-4xl mb-2 block">calculate</span>
            <p class="text-sm">Haz clic en "Calcular" para ejecutar el motor de liquidación sobre todas las operaciones vigentes.</p>
          </div>
        }

        <!-- Detalle por operación -->
        @if (liq()!.detalle.length > 0) {
          <div class="card p-0 overflow-hidden">
            <div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <h3 class="text-sm font-semibold text-neutral-700">
                Detalle por operación ({{ liq()!.detalle.length }})
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Referencia</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Prestataria</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-neutral-500">Prestamista</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">Intereses</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">Ret. Fuente</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">Ret. ICA</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-neutral-500">Neto</th>
                    @if (liq()!.estado === 'APROBADA' || liq()!.estado === 'CONTABILIZADA') {
                      <th class="px-4 py-2 text-center text-xs font-medium text-neutral-500">Plantilla</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                  @for (d of liq()!.detalle; track d.id) {
                    <tr class="hover:bg-neutral-50">
                      <td class="px-4 py-2 font-mono text-xs font-semibold text-brand-primary">
                        {{ d.referencia ?? '—' }}
                      </td>
                      <td class="px-4 py-2 text-neutral-700">{{ d.empresaPrestatariaNombre ?? '—' }}</td>
                      <td class="px-4 py-2 text-neutral-500">{{ d.empresaPrestamistaNombre ?? '—' }}</td>
                      <td class="px-4 py-2 text-right font-medium text-neutral-900">{{ d.interesesPeriodo | currencyCop }}</td>
                      <td class="px-4 py-2 text-right text-red-600">{{ d.retencionFuenteAplicada | currencyCop }}</td>
                      <td class="px-4 py-2 text-right text-orange-600">{{ d.retencionIcaAplicada | currencyCop }}</td>
                      <td class="px-4 py-2 text-right font-bold text-green-700">{{ d.netoCobrar | currencyCop }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (liq()!.aprobadaPorNombre) {
          <p class="text-xs text-neutral-400 text-right">
            Aprobada por {{ liq()!.aprobadaPorNombre }} el {{ liq()!.aprobadaAt | date:'dd/MM/yyyy HH:mm' }}
          </p>
        }

        @if (error()) {
          <p class="text-sm text-red-600 text-center">{{ error() }}</p>
        }
      }
    </div>

    <app-confirm-dialog
      [open]="confirmarAprobar"
      title="Aprobar liquidación"
      [message]="'¿Aprobar la liquidación de ' + liq()?.periodo + '? Total intereses: ' + (liq()?.totalInteresesLiquidados ?? '0')"
      confirmLabel="Sí, aprobar"
      (confirmed)="aprobar()"
      (cancelled)="confirmarAprobar = false" />

    <app-confirm-dialog
      [open]="confirmarRevertir"
      title="Revertir liquidación"
      message="¿Revertir a BORRADOR? Los tramos cerrados serán reabiertos."
      confirmLabel="Sí, revertir"
      (confirmed)="revertir()"
      (cancelled)="confirmarRevertir = false" />
  `,
})
export class LiquidacionDetallePage implements OnInit, OnDestroy {
  readonly router        = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(LiquidacionService);

  liqId  = 0;
  liq    = signal<LiquidacionMensual | null>(null);
  loading = signal(true);
  saving  = signal(false);
  error   = signal<string | null>(null);

  confirmarAprobar = false;
  confirmarRevertir = false;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.liqId = +this.route.snapshot.paramMap.get('id')!;
    this.cargar();
  }

  ngOnDestroy() { if (this.pollingInterval) clearInterval(this.pollingInterval); }

  cargar() {
    this.loading.set(true);
    this.svc.obtener(this.liqId).subscribe({
      next: d => { this.liq.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  calcular() {
    this.saving.set(true); this.error.set(null);
    this.svc.calcular(this.liqId).subscribe({
      next: d => { this.liq.set(d); this.saving.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Error al calcular'); this.saving.set(false); },
    });
  }

  aprobar() {
    this.confirmarAprobar = false; this.saving.set(true);
    this.svc.aprobar(this.liqId).subscribe({
      next: d => { this.liq.set(d); this.saving.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Error al aprobar'); this.saving.set(false); },
    });
  }

  revertir() {
    this.confirmarRevertir = false; this.saving.set(true);
    this.svc.revertir(this.liqId).subscribe({
      next: d => { this.liq.set(d); this.saving.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Error al revertir'); this.saving.set(false); },
    });
  }

  marcarContabilizada() {
    this.saving.set(true);
    this.svc.marcarContabilizada(this.liqId).subscribe({
      next: d => { this.liq.set(d); this.saving.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Error'); this.saving.set(false); },
    });
  }

  estadoLabel(e: string): string { return (LIQUIDACION_ESTADO_LABEL as Record<string, string>)[e] ?? e; }
  estadoColor(e: string): string { return (LIQUIDACION_ESTADO_COLOR as Record<string, string>)[e] ?? ''; }
}
