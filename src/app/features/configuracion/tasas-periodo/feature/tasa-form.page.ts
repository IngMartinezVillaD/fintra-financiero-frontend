import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TasasService } from '../data-access/tasas.service';
import { TasasStore } from '../data-access/tasas.store';
import { getErrorMessage, markAllAsTouched } from '@shared/utils/form.utils';
import { MESES, TipoTasa, TIPO_TASA_LABEL } from '../domain/tasa-periodo.model';
import { ToastService } from '@shared/services/toast.service';

/** Convierte EA → EM: ((1 + EA/100)^(1/12) − 1) × 100 */
function eaToEm(ea: number): number {
  return (Math.pow(1 + ea / 100, 1 / 12) - 1) * 100;
}

@Component({
  selector: 'app-tasa-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">

      <!-- Page header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <button (click)="volver()" class="text-neutral-400 hover:text-neutral-700 transition-colors mt-0.5">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 class="text-[17px] font-bold text-neutral-900">Registrar tasas del período</h1>
            <p class="text-[12px] text-neutral-400 mt-0.5">Las tres tasas deben registrarse y aprobarse para habilitar las operaciones</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" (click)="volver()"
                  class="px-3.5 py-[7px] rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
            Cancelar
          </button>
          <button type="button" (click)="guardar()" [disabled]="saving()"
                  class="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50">
            @if (saving()) {
              <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            }
            Enviar a aprobación
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="space-y-3">

        <!-- ① Período -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">1</span>
            <span class="section-title">Período</span>
          </div>
          <div class="grid grid-cols-2 gap-3 p-3.5 pb-0">
            <div class="flex flex-col gap-1">
              <label class="field-label">Año <span class="text-danger">*</span></label>
              <input formControlName="anio" class="field-input" type="number" min="2024" max="2100" placeholder="2026">
              @if (err('anio')) { <span class="text-[10px] text-danger">{{ err('anio') }}</span> }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Mes <span class="text-danger">*</span></label>
              <select formControlName="mes" class="field-input">
                <option value="">Seleccionar...</option>
                @for (m of meses; track m.num) {
                  <option [value]="m.num">{{ m.label }}</option>
                }
              </select>
              @if (err('mes')) { <span class="text-[10px] text-danger">{{ err('mes') }}</span> }
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 p-3.5">
            <div class="flex flex-col gap-1">
              <label class="field-label">Vigencia desde <span class="text-danger">*</span></label>
              <input formControlName="vigenciaDesde" class="field-input" type="date">
              @if (err('vigenciaDesde')) { <span class="text-[10px] text-danger">{{ err('vigenciaDesde') }}</span> }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Vigencia hasta <span class="text-danger">*</span></label>
              <input formControlName="vigenciaHasta" class="field-input" type="date">
              @if (err('vigenciaHasta')) { <span class="text-[10px] text-danger">{{ err('vigenciaHasta') }}</span> }
            </div>
          </div>
        </div>

        <!-- ② Tipo de tasa -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">2</span>
            <span class="section-title">Tipo de tasa</span>
          </div>
          <div class="p-3.5">
            <div class="flex flex-col gap-1">
              <label class="field-label">Tipo <span class="text-danger">*</span></label>
              <select formControlName="tipoTasa" class="field-input">
                <option value="">Seleccionar...</option>
                @for (t of tipos; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
              @if (err('tipoTasa')) { <span class="text-[10px] text-danger">{{ err('tipoTasa') }}</span> }
            </div>
          </div>
        </div>

        <!-- ③ Valores -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">3</span>
            <span class="section-title">Valores</span>
          </div>
          <div class="grid grid-cols-2 gap-3 p-3.5 pb-3">
            <div class="flex flex-col gap-1">
              <label class="field-label">Tasa Efectiva Anual (%) <span class="text-danger">*</span></label>
              <input formControlName="valorPorcentajeEfectivoAnual" class="field-input"
                     type="number" step="0.0001" min="0.0001" placeholder="24.0000"
                     (input)="calcularEm()">
              @if (err('valorPorcentajeEfectivoAnual')) {
                <span class="text-[10px] text-danger">{{ err('valorPorcentajeEfectivoAnual') }}</span>
              }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">
                Tasa Efectiva Mensual (%) <span class="text-danger">*</span>
                @if (emCalculada()) {
                  <span class="ml-1 text-info normal-case font-normal tracking-normal">calculado: {{ emCalculada() }}%</span>
                }
              </label>
              <input formControlName="valorPorcentajeMensual" class="field-input"
                     type="number" step="0.0001" min="0.0001" placeholder="1.8265">
              @if (err('valorPorcentajeMensual')) {
                <span class="text-[10px] text-danger">{{ err('valorPorcentajeMensual') }}</span>
              }
            </div>
          </div>
          @if (emCalculada()) {
            <div class="mx-3.5 mb-3.5 flex items-center gap-2 bg-info/10 border border-info/20 rounded-md px-3 py-2">
              <span class="material-symbols-outlined text-info text-sm">calculate</span>
              <p class="text-[11px] text-info">
                Conversión automática: {{ form.value.valorPorcentajeEfectivoAnual }}% E.A.
                → <strong>{{ emCalculada() }}% E.M.</strong>
                (fórmula: (1 + EA/100)^(1/12) − 1)
              </p>
            </div>
          }
        </div>

        <!-- ④ Observación -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">4</span>
            <span class="section-title">Observación</span>
            <span class="ml-1 text-[10px] text-neutral-400 font-normal tracking-normal normal-case">opcional</span>
          </div>
          <div class="p-3.5">
            <div class="flex flex-col gap-1">
              <label class="field-label">Fuente o referencia normativa</label>
              <input formControlName="observacion" class="field-input"
                     placeholder="Ej: Superfinanciera circular 02/2026">
            </div>
          </div>
        </div>

        <!-- Error general -->
        @if (error()) {
          <div class="flex items-center gap-2 bg-danger-light border border-danger/30 text-danger text-xs rounded-lg px-4 py-3" role="alert">
            <span class="material-symbols-outlined text-base">error</span>
            {{ error() }}
          </div>
        }

      </form>
    </div>
  `,
})
export class TasaFormPage {
  private readonly svc    = inject(TasasService);
  private readonly store  = inject(TasasStore);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);

  protected saving      = signal(false);
  protected error       = signal<string | null>(null);
  protected emCalculada = signal<string | null>(null);

  protected readonly tipos = (Object.entries(TIPO_TASA_LABEL) as [TipoTasa, string][])
    .map(([value, label]) => ({ value, label }));

  protected readonly meses = Object.entries(MESES)
    .map(([num, label]) => ({ num: Number(num), label }));

  protected readonly form = new FormGroup({
    anio:                         new FormControl<number | null>(null, [Validators.required, Validators.min(2024)]),
    mes:                          new FormControl<number | null>(null, [Validators.required]),
    tipoTasa:                     new FormControl('', [Validators.required]),
    valorPorcentajeEfectivoAnual: new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)]),
    valorPorcentajeMensual:       new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)]),
    vigenciaDesde:                new FormControl('', [Validators.required]),
    vigenciaHasta:                new FormControl('', [Validators.required]),
    observacion:                  new FormControl(''),
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
      anio:     v.anio!,
      mes:      v.mes!,
      tipoTasa: v.tipoTasa as TipoTasa,
      valorPorcentajeEfectivoAnual: String(v.valorPorcentajeEfectivoAnual),
      valorPorcentajeMensual:       String(v.valorPorcentajeMensual),
      vigenciaDesde: v.vigenciaDesde!,
      vigenciaHasta: v.vigenciaHasta!,
      observacion:   v.observacion || undefined,
    }).subscribe({
      next:  () => { this.saving.set(false); this.toast.success('Tasa guardada exitosamente'); this.router.navigate(['/configuracion/tasas-periodo']); },
      error: (e) => { this.saving.set(false); const msg = e.error?.message ?? 'Error al guardar la tasa'; this.error.set(msg); this.toast.error(msg); },
    });
  }

  protected volver(): void { this.router.navigate(['/configuracion/tasas-periodo']); }
}
