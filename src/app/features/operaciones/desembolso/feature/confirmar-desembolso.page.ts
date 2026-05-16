import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { DesembolsoService } from '../data-access/desembolso.service';
import { OperacionesService } from '../../data-access/operaciones.service';
import { GmfResumenComponent } from '../ui/gmf-resumen.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { Desembolso, GmfResumen } from '../domain/desembolso.model';
import { Operacion } from '../../domain/operacion.model';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-confirmar-desembolso',
  standalone: true,
  imports: [FormsModule, GmfResumenComponent, CurrencyCopPipe, ButtonComponent, ConfirmDialogComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <button (click)="router.navigate(['/operaciones/desembolsos'])"
                class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Confirmar desembolso</h1>
          @if (operacion()) {
            <p class="text-sm text-neutral-500 font-mono">{{ operacion()!.referencia }}</p>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="card space-y-3 p-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-5 bg-neutral-200 rounded animate-pulse w-3/4"></div>
          }
        </div>
      } @else if (operacion()) {
        <div class="card space-y-5 p-6">

          <!-- Empresas -->
          <div class="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
            <div>
              <p class="text-xs text-neutral-500 mb-1">Empresa prestamista</p>
              <p class="text-sm font-medium text-neutral-900">{{ operacion()!.empresaPrestamistaNombre }}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 mb-1">Empresa prestataria</p>
              <p class="text-sm font-medium text-neutral-900">{{ operacion()!.empresaPrestatariaNombre }}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 mb-1">Cuenta origen (prestamista)</p>
              <p class="text-sm text-neutral-700">{{ operacion()!.cuentaOrigenDescripcion ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 mb-1">Cuenta destino (prestataria)</p>
              <p class="text-sm text-neutral-700">{{ operacion()!.cuentaDestinoDescripcion ?? '—' }}</p>
            </div>
          </div>

          <!-- Monto real -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Monto real a desembolsar <span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-neutral-400 mb-2">
              Monto estimado en la operación:
              {{ operacion()!.montoEstimado ? (operacion()!.montoEstimado! | currencyCop) : 'No indicado' }}
            </p>
            <input type="number" min="1" step="1000"
                   [(ngModel)]="monto"
                   (ngModelChange)="onMontoChange($event)"
                   placeholder="0"
                   class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                          focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"/>
          </div>

          <!-- Fecha -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Fecha de desembolso</label>
            <input type="date" [(ngModel)]="fecha"
                   class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                          focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"/>
          </div>

          <!-- GMF -->
          <app-gmf-resumen [gmf]="gmfPreview()" />

          <!-- Preview tramo -->
          @if (monto && +monto > 0) {
            <div class="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
              <p class="text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                Preview tramo inicial
              </p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-neutral-500">Tipo:</span>
                  <span class="ml-1 font-medium text-neutral-800">{{ labelInteres(operacion()!.cobraInteres) }}</span>
                </div>
                <div>
                  <span class="text-neutral-500">Capital:</span>
                  <span class="ml-1 font-medium text-neutral-800">{{ monto | currencyCop }}</span>
                </div>
                <div>
                  <span class="text-neutral-500">Desde:</span>
                  <span class="ml-1 text-neutral-800">{{ fecha }}</span>
                </div>
                <div>
                  <span class="text-neutral-500">Hasta:</span>
                  <span class="ml-1 text-neutral-800">fin de mes</span>
                </div>
              </div>
            </div>
          }

          @if (error()) {
            <p class="text-sm text-red-600">{{ error() }}</p>
          }

          <!-- Botón confirmar -->
          <div class="flex justify-end gap-3 pt-2">
            <button (click)="router.navigate(['/operaciones/desembolsos'])"
                    class="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors">
              Cancelar
            </button>
            <app-button
              [disabled]="!monto || +monto <= 0 || saving()"
              [loading]="saving()"
              (clicked)="mostrarConfirmacion = true">
              <span class="material-symbols-outlined text-sm mr-1">payments</span>
              Confirmar desembolso
            </app-button>
          </div>
        </div>
      } @else if (!loading()) {
        <p class="text-center text-neutral-500 py-12">Operación no encontrada.</p>
      }

      <!-- Resultado -->
      @if (resultado()) {
        <div class="card border-green-200 bg-green-50 p-5">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-green-600">check_circle</span>
            <p class="font-semibold text-green-800">Desembolso confirmado</p>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-green-700">Monto:</span>
              <span class="ml-1 font-medium">{{ resultado()!.monto | currencyCop }}</span></div>
            <div><span class="text-green-700">Fecha:</span>
              <span class="ml-1 font-medium">{{ resultado()!.fecha }}</span></div>
            <div><span class="text-green-700">GMF:</span>
              <span class="ml-1 font-medium">{{ resultado()!.gmfCalculado | currencyCop }}</span></div>
          </div>
          @if (resultado()!.tramoInicial) {
            <div class="mt-3 pt-3 border-t border-green-200">
              <p class="text-xs font-semibold text-green-700 mb-1">Tramo 1 abierto</p>
              <p class="text-sm text-green-800">
                {{ resultado()!.tramoInicial!.fechaDesde }} →
                {{ resultado()!.tramoInicial!.fechaHasta }}
                ({{ resultado()!.tramoInicial!.dias }} días)
              </p>
            </div>
          }
          <button (click)="router.navigate(['/operaciones', operacion()!.id])"
                  class="mt-4 text-sm text-green-700 underline hover:text-green-900">
            Ver detalle de la operación
          </button>
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="mostrarConfirmacion"
      title="Confirmar desembolso"
      [message]="'¿Confirmar desembolso de ' + (monto | currencyCop) + ' para ' + operacion()?.referencia + '? Esta acción no se puede revertir.'"
      confirmLabel="Sí, desembolsar"
      (confirmed)="confirmar()"
      (cancelled)="mostrarConfirmacion = false" />
  `,
})
export class ConfirmarDesembolsoPage implements OnInit {
  readonly router  = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly opSvc = inject(OperacionesService);
  private readonly svc   = inject(DesembolsoService);
  private readonly toast = inject(ToastService);

  operacionId = 0;
  operacion   = signal<Operacion | null>(null);
  loading     = signal(true);
  saving      = signal(false);
  error       = signal<string | null>(null);
  gmfPreview  = signal<GmfResumen | null>(null);
  resultado   = signal<Desembolso | null>(null);
  mostrarConfirmacion = false;

  monto = '';
  fecha = new Date().toISOString().split('T')[0];

  private readonly montoChange$ = new Subject<string>();

  ngOnInit() {
    this.operacionId = +this.route.snapshot.paramMap.get('id')!;

    this.opSvc.obtener(this.operacionId).subscribe({
      next: op => { this.operacion.set(op); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar la operación'); this.loading.set(false); },
    });

    this.montoChange$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(m => this.svc.gmfPreview(this.operacionId, m)),
    ).subscribe({
      next: gmf => this.gmfPreview.set(gmf),
      error: ()  => this.gmfPreview.set(null),
    });
  }

  onMontoChange(val: string) {
    if (val && +val > 0) this.montoChange$.next(val);
    else this.gmfPreview.set(null);
  }

  confirmar() {
    this.mostrarConfirmacion = false;
    if (!this.monto || +this.monto <= 0) return;

    this.saving.set(true);
    this.error.set(null);

    this.svc.confirmar(this.operacionId, { monto: this.monto, fecha: this.fecha }).subscribe({
      next: res => { this.resultado.set(res); this.saving.set(false); this.toast.success('Desembolso confirmado exitosamente'); },
      error: err => {
        const msg = err?.error?.message ?? 'Error al confirmar el desembolso';
        this.error.set(msg);
        this.toast.error(msg);
        this.saving.set(false);
      },
    });
  }

  labelInteres(cobra: string): string {
    const m: Record<string, string> = {
      SI_COMERCIAL: 'Tasa comercial', SI_ESPECIAL: 'Tasa especial', NO: 'Sin interés',
    };
    return m[cobra] ?? cobra;
  }
}
