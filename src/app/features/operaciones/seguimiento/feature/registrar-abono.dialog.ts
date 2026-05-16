import { Component, EventEmitter, inject, input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { SeguimientoService } from '../data-access/seguimiento.service';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { RegistrarAbonoRequest, RegistrarAbonoResponse } from '../domain/seguimiento.model';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-registrar-abono-dialog',
  standalone: true,
  imports: [FormsModule, CurrencyCopPipe, ButtonComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-neutral-900">Registrar abono</h2>
            <button (click)="cerrar.emit()" class="text-neutral-400 hover:text-neutral-700">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha del abono <span class="text-red-500">*</span>
                </label>
                <input type="date" [(ngModel)]="form.fechaAbono"
                       class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                              focus:outline-none focus:ring-2 focus:ring-brand-primary/30"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">
                  Monto <span class="text-red-500">*</span>
                </label>
                <input type="number" min="1" step="1000"
                       [(ngModel)]="form.monto"
                       (ngModelChange)="onMontoChange()"
                       class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                              focus:outline-none focus:ring-2 focus:ring-brand-primary/30"/>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                Número de comprobante <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="form.numeroComprobante"
                     class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-brand-primary/30"/>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Observaciones</label>
              <textarea [(ngModel)]="form.observaciones" rows="2"
                        class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"></textarea>
            </div>

            <!-- Preview -->
            @if (preview()) {
              <div class="rounded-lg bg-neutral-50 border border-neutral-200 p-4 space-y-2">
                <p class="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                  Aplicación del pago
                </p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-neutral-500">A intereses:</span>
                    <span class="ml-1 font-medium text-amber-700">
                      {{ preview()!.abono.aplicadoAIntereses | currencyCop }}
                    </span>
                  </div>
                  <div>
                    <span class="text-neutral-500">A capital:</span>
                    <span class="ml-1 font-medium text-blue-700">
                      {{ preview()!.abono.aplicadoACapital | currencyCop }}
                    </span>
                  </div>
                  <div>
                    <span class="text-neutral-500">Nuevo saldo capital:</span>
                    <span class="ml-1 font-bold text-neutral-900">
                      {{ preview()!.saldosActuales.saldoCapital | currencyCop }}
                    </span>
                  </div>
                  @if (preview()!.operacionSaldada) {
                    <div class="col-span-2">
                      <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                        ✓ Operación quedaría saldada
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (previewError()) {
              <p class="text-sm text-red-600">{{ previewError() }}</p>
            }
            @if (error()) {
              <p class="text-sm text-red-600">{{ error() }}</p>
            }
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="cerrar.emit()"
                    class="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors">
              Cancelar
            </button>
            <app-button
              [disabled]="!formValido() || saving()"
              [loading]="saving()"
              (clicked)="confirmar()">
              Registrar abono
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RegistrarAbonoDialog implements OnChanges {
  private readonly svc   = inject(SeguimientoService);
  private readonly toast = inject(ToastService);

  open        = input(false);
  operacionId = input(0);

  @Output() cerrar    = new EventEmitter<void>();
  @Output() registrado = new EventEmitter<RegistrarAbonoResponse>();

  saving      = signal(false);
  preview     = signal<RegistrarAbonoResponse | null>(null);
  previewError = signal<string | null>(null);
  error       = signal<string | null>(null);

  form: RegistrarAbonoRequest = {
    fechaAbono: new Date().toISOString().split('T')[0] as string,
    monto: '',
    numeroComprobante: '',
  };

  private readonly montoChange$ = new Subject<void>();

  ngOnChanges() {
    if (this.open()) {
      this.form = { fechaAbono: new Date().toISOString().split('T')[0] as string, monto: '', numeroComprobante: '' };
      this.preview.set(null);
      this.error.set(null);

      this.montoChange$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(() => this.svc.previewAbono(this.operacionId(), this.form)),
      ).subscribe({
        next: p => { this.preview.set(p); this.previewError.set(null); },
        error: err => {
          this.preview.set(null);
          this.previewError.set(err?.error?.message ?? 'No se puede calcular la aplicación');
        },
      });
    }
  }

  onMontoChange() {
    if (this.form.monto && +this.form.monto > 0 && this.form.fechaAbono) {
      this.montoChange$.next();
    } else {
      this.preview.set(null);
    }
  }

  formValido(): boolean {
    return !!(this.form.fechaAbono && this.form.monto && +this.form.monto > 0
              && this.form.numeroComprobante?.trim());
  }

  confirmar() {
    this.saving.set(true);
    this.error.set(null);
    this.svc.registrarAbono(this.operacionId(), this.form).subscribe({
      next: res => { this.saving.set(false); this.toast.success('Abono registrado exitosamente'); this.registrado.emit(res); },
      error: err => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al registrar el abono';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
