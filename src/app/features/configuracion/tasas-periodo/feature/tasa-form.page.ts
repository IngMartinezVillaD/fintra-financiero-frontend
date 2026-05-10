import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TasasService } from '../data-access/tasas.service';
import { TasasStore } from '../data-access/tasas.store';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import { getErrorMessage, markAllAsTouched } from '@shared/utils/form.utils';
import { MESES, TipoTasa, TIPO_TASA_LABEL } from '../domain/tasa-periodo.model';

/** Convierte EA → EM: ((1 + EA/100)^(1/12) − 1) × 100 */
function eaToEm(ea: number): number {
  return (Math.pow(1 + ea / 100, 1 / 12) - 1) * 100;
}

@Component({
  selector: 'app-tasa-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <button (click)="volver()" class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Registrar tasas del período</h1>
          <p class="text-sm text-neutral-500">Las tres tasas deben registrarse y aprobarse para habilitar las operaciones</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">

        <!-- Período -->
        <div class="card space-y-4">
          <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">Período</h2>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Año" [required]="true" [error]="err('anio')">
              <input formControlName="anio" class="form-input" type="number" min="2024" max="2100" placeholder="2026">
            </app-form-field>
            <app-form-field label="Mes" [required]="true" [error]="err('mes')">
              <select formControlName="mes" class="form-input">
                <option value="">Seleccionar...</option>
                @for (m of meses; track m.num) {
                  <option [value]="m.num">{{ m.label }}</option>
                }
              </select>
            </app-form-field>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Vigencia desde" [required]="true" [error]="err('vigenciaDesde')">
              <input formControlName="vigenciaDesde" class="form-input" type="date">
            </app-form-field>
            <app-form-field label="Vigencia hasta" [required]="true" [error]="err('vigenciaHasta')">
              <input formControlName="vigenciaHasta" class="form-input" type="date">
            </app-form-field>
          </div>
        </div>

        <!-- Tipo de tasa -->
        <div class="card space-y-4">
          <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">Tipo de tasa</h2>
          <app-form-field label="Tipo" [required]="true" [error]="err('tipoTasa')">
            <select formControlName="tipoTasa" class="form-input">
              <option value="">Seleccionar...</option>
              @for (t of tipos; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </app-form-field>
        </div>

        <!-- Tasas -->
        <div class="card space-y-4">
          <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">Valores</h2>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Tasa Efectiva Anual (%)" [required]="true" [error]="err('valorPorcentajeEfectivoAnual')">
              <input formControlName="valorPorcentajeEfectivoAnual" class="form-input"
                     type="number" step="0.0001" min="0.0001" placeholder="24.0000"
                     (input)="calcularEm()">
            </app-form-field>
            <app-form-field label="Tasa Efectiva Mensual (%)"
                            [required]="true"
                            [hint]="emCalculada() ? 'Calculado: ' + emCalculada() + '%' : ''"
                            [error]="err('valorPorcentajeMensual')">
              <input formControlName="valorPorcentajeMensual" class="form-input"
                     type="number" step="0.0001" min="0.0001" placeholder="1.8265">
            </app-form-field>
          </div>
          @if (emCalculada()) {
            <p class="text-xs text-info bg-info/10 rounded-lg px-3 py-2">
              <span class="material-symbols-outlined text-sm align-middle mr-1">calculate</span>
              Conversión automática: {{ form.value.valorPorcentajeEfectivoAnual }}% E.A.
              → <strong>{{ emCalculada() }}% E.M.</strong>
              (fórmula: (1 + EA/100)^(1/12) − 1)
            </p>
          }
        </div>

        <app-form-field label="Observación" hint="Opcional — referencia normativa o fuente (ej: Superfinanciera circular 02/2026)">
          <input formControlName="observacion" class="form-input" placeholder="Fuente o referencia...">
        </app-form-field>

        @if (error()) {
          <div class="bg-danger-light border border-danger/30 text-danger text-sm rounded-lg p-3" role="alert">
            {{ error() }}
          </div>
        }

        <div class="flex gap-3 justify-end">
          <app-button variant="ghost" type="button" (clicked)="volver()">Cancelar</app-button>
          <app-button type="submit" [loading]="saving()">Enviar a aprobación</app-button>
        </div>
      </form>
    </div>
  `,
})
export class TasaFormPage {
  private readonly svc    = inject(TasasService);
  private readonly store  = inject(TasasStore);
  private readonly router = inject(Router);

  protected saving     = signal(false);
  protected error      = signal<string | null>(null);
  protected emCalculada = signal<string | null>(null);

  protected readonly tipos = (Object.entries(TIPO_TASA_LABEL) as [TipoTasa, string][])
    .map(([value, label]) => ({ value, label }));

  protected readonly meses = Object.entries(MESES)
    .map(([num, label]) => ({ num: Number(num), label }));

  protected readonly form = new FormGroup({
    anio:                        new FormControl<number | null>(null, [Validators.required, Validators.min(2024)]),
    mes:                         new FormControl<number | null>(null, [Validators.required]),
    tipoTasa:                    new FormControl('', [Validators.required]),
    valorPorcentajeEfectivoAnual: new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)]),
    valorPorcentajeMensual:       new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)]),
    vigenciaDesde:               new FormControl('', [Validators.required]),
    vigenciaHasta:               new FormControl('', [Validators.required]),
    observacion:                 new FormControl(''),
  });

  protected calcularEm(): void {
    const ea = this.form.value.valorPorcentajeEfectivoAnual;
    if (ea && ea > 0) {
      const em = eaToEm(ea);
      const emStr = em.toFixed(4);
      this.emCalculada.set(emStr);
      this.form.patchValue({ valorPorcentajeMensual: Number(emStr) }, { emitEvent: false });
    } else {
      this.emCalculada.set(null);
    }
  }

  protected err(field: string): string {
    return getErrorMessage(this.form.get(field)) ?? '';
  }

  protected guardar(): void {
    if (this.form.invalid) { markAllAsTouched(this.form); return; }
    this.saving.set(true);
    this.error.set(null);

    const v = this.form.value;
    this.svc.registrar({
      anio: v.anio!,
      mes:  v.mes!,
      tipoTasa: v.tipoTasa as TipoTasa,
      valorPorcentajeEfectivoAnual: String(v.valorPorcentajeEfectivoAnual),
      valorPorcentajeMensual:       String(v.valorPorcentajeMensual),
      vigenciaDesde: v.vigenciaDesde!,
      vigenciaHasta: v.vigenciaHasta!,
      observacion:   v.observacion || undefined,
    }).subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/configuracion/tasas-periodo']); },
      error: (e) => { this.saving.set(false); this.error.set(e.error?.message ?? 'Error al guardar la tasa'); },
    });
  }

  protected volver(): void { this.router.navigate(['/configuracion/tasas-periodo']); }
}
