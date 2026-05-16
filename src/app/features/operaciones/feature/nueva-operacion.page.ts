import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperacionesService } from '../data-access/operaciones.service';
import { EmpresasService } from '../../configuracion/empresas/data-access/empresas.service';
import { TasasService } from '../../configuracion/tasas-periodo/data-access/tasas.service';
import { getErrorMessage, markAllAsTouched } from '@shared/utils/form.utils';
import { AvisoTramoAnterior, CobraInteres } from '../domain/operacion.model';
import { EmpresaListItem, CuentaBancaria } from '../../configuracion/empresas/domain/empresa.model';
import { TasaPeriodo } from '../../configuracion/tasas-periodo/domain/tasa-periodo.model';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-nueva-operacion',
  standalone: true,
  imports: [ReactiveFormsModule, MoneyInputComponent],
  template: `
    <div class="max-w-3xl mx-auto">

      <!-- Page header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <button (click)="volver()" class="text-neutral-400 hover:text-neutral-700 transition-colors mt-0.5">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 class="text-[17px] font-bold text-neutral-900">Nueva operación</h1>
            <p class="text-[12px] text-neutral-400 mt-0.5">Préstamo intercompañía — Etapa CR</p>
          </div>
        </div>
        <button type="button" (click)="volver()"
                class="px-3.5 py-[7px] rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
          Cancelar
        </button>
      </div>

      <!-- Stepper -->
      <div class="bg-white border border-neutral-200 rounded-lg px-6 py-4 mb-3">
        <div class="flex gap-0">
          @for (s of steps; track s.num; let last = $last) {
            <div class="flex items-center">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                     [class]="currentStep() >= s.num ? 'bg-brand-primary text-white' : 'bg-neutral-100 text-neutral-400'">
                  {{ s.num }}
                </div>
                <span class="text-[10px] mt-1 w-16 text-center leading-tight font-medium"
                      [class]="currentStep() >= s.num ? 'text-neutral-700' : 'text-neutral-400'">
                  {{ s.label }}
                </span>
              </div>
              @if (!last) {
                <div class="h-0.5 w-8 mx-1 mb-5 transition-colors"
                     [class]="currentStep() > s.num ? 'bg-brand-primary' : 'bg-neutral-200'"></div>
              }
            </div>
          }
        </div>
      </div>

      <form [formGroup]="form" class="space-y-3">

        <!-- STEP 1 — Partes -->
        @if (currentStep() === 1) {
          <div class="section-block">
            <div class="section-header">
              <span class="section-title">Partes de la operación</span>
            </div>
            <div class="grid grid-cols-2 gap-3 p-3.5 pb-0">
              <div class="flex flex-col gap-1">
                <label class="field-label">Empresa Prestamista <span class="text-danger">*</span></label>
                <select formControlName="empresaPrestamistaId" class="field-input" (change)="onPrestamistaChange()">
                  <option value="">Seleccionar...</option>
                  @for (e of empresas(); track e.id) {
                    @if (e.rolPermitido === 'PRESTAMISTA' || e.rolPermitido === 'AMBOS') {
                      <option [value]="e.id">{{ e.codigoInterno }} — {{ e.razonSocial }}</option>
                    }
                  }
                </select>
                @if (err('empresaPrestamistaId')) {
                  <span class="text-[10px] text-danger">{{ err('empresaPrestamistaId') }}</span>
                }
              </div>
              <div class="flex flex-col gap-1">
                <label class="field-label">Empresa Prestataria <span class="text-danger">*</span></label>
                <select formControlName="empresaPrestatariaId" class="field-input" (change)="onPrestatariaChange()">
                  <option value="">Seleccionar...</option>
                  @for (e of empresas(); track e.id) {
                    @if (e.rolPermitido === 'PRESTATARIA' || e.rolPermitido === 'AMBOS') {
                      <option [value]="e.id"
                              [disabled]="e.id === +(form.value.empresaPrestamistaId ?? 0)">
                        {{ e.codigoInterno }} — {{ e.razonSocial }}
                      </option>
                    }
                  }
                </select>
                @if (err('empresaPrestatariaId')) {
                  <span class="text-[10px] text-danger">{{ err('empresaPrestatariaId') }}</span>
                }
              </div>
            </div>
            <div class="p-3.5 pt-2">
              <div class="flex items-center gap-2 justify-center text-neutral-300">
                <span class="material-symbols-outlined text-2xl text-brand-primary">arrow_forward</span>
              </div>
            </div>
          </div>
        }

        <!-- STEP 2 — Condiciones de interés -->
        @if (currentStep() === 2) {
          <div class="section-block">
            <div class="section-header">
              <span class="section-title">Condiciones de interés</span>
            </div>
            <div class="p-3.5 space-y-2">
              @for (opt of cobraInteresOpts; track opt.value) {
                <label class="flex items-start gap-3 px-3.5 py-3 rounded-lg border cursor-pointer transition-colors"
                       [class]="form.value.cobraInteres === opt.value
                         ? 'border-brand-primary bg-brand-light'
                         : 'border-neutral-200 hover:border-neutral-300 bg-white'">
                  <input type="radio" formControlName="cobraInteres" [value]="opt.value"
                         class="mt-0.5 accent-brand-primary shrink-0">
                  <div>
                    <p class="text-xs font-semibold text-neutral-800">{{ opt.label }}</p>
                    <p class="text-[11px] text-neutral-500 mt-0.5">{{ opt.hint }}</p>
                    @if (opt.value === 'SI_COMERCIAL' && tasaComercial()) {
                      <p class="text-[11px] text-success mt-1 font-semibold">
                        Tasa vigente: {{ tasaComercial()!.valorPorcentajeEfectivoAnual }}% E.A.
                      </p>
                    }
                    @if (opt.value === 'SI_COMERCIAL' && !tasaComercial()) {
                      <p class="text-[11px] text-danger mt-1">⚠ No hay tasa comercial vigente</p>
                    }
                  </div>
                </label>
              }
            </div>
          </div>
        }

        <!-- STEP 3 — Cuentas y monto -->
        @if (currentStep() === 3) {
          <div class="section-block">
            <div class="section-header">
              <span class="section-title">Cuentas bancarias y monto</span>
            </div>
            <div class="p-3.5 space-y-3">
              <div class="flex flex-col gap-1">
                <label class="field-label">Cuenta origen (Prestamista)</label>
                <select formControlName="cuentaOrigenId" class="field-input">
                  <option value="">Sin cuenta origen</option>
                  @for (c of cuentasPrestamista(); track c.id) {
                    <option [value]="c.id">
                      {{ c.bancoNombre }} — {{ c.numeroCuenta }} ({{ c.tipo }}){{ c.exentaGmf ? ' · Exenta GMF' : '' }}
                    </option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="field-label">Cuenta destino (Prestataria)</label>
                <select formControlName="cuentaDestinoId" class="field-input">
                  <option value="">Sin cuenta destino</option>
                  @for (c of cuentasPrestataria(); track c.id) {
                    <option [value]="c.id">
                      {{ c.bancoNombre }} — {{ c.numeroCuenta }} ({{ c.tipo }}){{ c.exentaGmf ? ' · Exenta GMF' : '' }}
                    </option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="field-label">Monto estimado
                  <span class="ml-1 font-normal normal-case tracking-normal text-neutral-400">Referencial — el monto real se confirma en el desembolso</span>
                </label>
                <app-money-input formControlName="montoEstimado"/>
              </div>
            </div>
          </div>
        }

        <!-- STEP 4 — Soporte documental -->
        @if (currentStep() === 4) {
          <div class="section-block">
            <div class="section-header">
              <span class="section-title">Soporte documental</span>
            </div>
            <div class="p-3.5 space-y-3">
              <div class="flex flex-col gap-1">
                <label class="field-label">N° Documento soporte (Campo 10 ERP) <span class="text-danger">*</span></label>
                <input formControlName="numDocumentoSoporte" class="field-input" placeholder="CONT-2026-018">
                @if (err('numDocumentoSoporte')) {
                  <span class="text-[10px] text-danger">{{ err('numDocumentoSoporte') }}</span>
                }
              </div>
              <div class="flex flex-col gap-1">
                <label class="field-label">Observaciones (Campo 27 ERP) <span class="text-danger">*</span></label>
                <textarea formControlName="observaciones" class="field-input min-h-28 resize-none"
                          placeholder="Préstamo para capital de trabajo Q2 2026..."></textarea>
                @if (err('observaciones')) {
                  <span class="text-[10px] text-danger">{{ err('observaciones') }}</span>
                }
              </div>
            </div>
          </div>
        }

        <!-- STEP 5 — Revisión final -->
        @if (currentStep() === 5) {
          <div class="section-block">
            <div class="section-header">
              <span class="section-title">Revisión final</span>
            </div>
            <div class="p-3.5 space-y-3">
              <dl class="grid grid-cols-2 gap-x-6 gap-y-3">
                <div class="flex flex-col gap-0.5">
                  <dt class="field-label">Prestamista</dt>
                  <dd class="text-xs font-semibold text-neutral-800">{{ empresaLabel(form.value.empresaPrestamistaId) }}</dd>
                </div>
                <div class="flex flex-col gap-0.5">
                  <dt class="field-label">Prestataria</dt>
                  <dd class="text-xs font-semibold text-neutral-800">{{ empresaLabel(form.value.empresaPrestatariaId) }}</dd>
                </div>
                <div class="flex flex-col gap-0.5">
                  <dt class="field-label">Cobra interés</dt>
                  <dd class="text-xs font-semibold text-neutral-800">{{ interesLabel(form.value.cobraInteres ?? '') }}</dd>
                </div>
                <div class="flex flex-col gap-0.5">
                  <dt class="field-label">Monto estimado</dt>
                  <dd class="text-xs font-semibold font-mono text-neutral-800">{{ form.value.montoEstimado || '—' }}</dd>
                </div>
                <div class="flex flex-col gap-0.5">
                  <dt class="field-label">N° Soporte</dt>
                  <dd class="text-xs font-semibold text-neutral-800">{{ form.value.numDocumentoSoporte }}</dd>
                </div>
              </dl>

              @if (avisoTramo()) {
                <div class="bg-warning-light border border-warning/30 rounded-lg p-3.5 space-y-1.5 mt-1">
                  <p class="text-xs font-bold text-warning flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">info</span>
                    Aviso — Tramo anterior activo
                  </p>
                  <p class="text-[11px] text-neutral-700">
                    La empresa prestataria tiene un crédito activo
                    ({{ avisoTramo()!.referencia }}) con saldo capital de
                    <strong>{{ avisoTramo()!.saldoCapital }}</strong>.
                  </p>
                  <p class="text-[11px] text-neutral-700">
                    Días transcurridos: <strong>{{ avisoTramo()!.diasTranscurridos }}</strong> —
                    Interés estimado causado:
                    <strong class="text-warning">{{ avisoTramo()!.interesEstimado }}</strong>
                  </p>
                  <p class="text-[10px] text-neutral-400">
                    Este interés se liquidará antes de abrir el nuevo tramo al momento del desembolso.
                  </p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Error -->
        @if (error()) {
          <div class="flex items-center gap-2 bg-danger-light border border-danger/30 text-danger text-xs rounded-lg px-4 py-3" role="alert">
            <span class="material-symbols-outlined text-base">error</span>
            {{ error() }}
          </div>
        }

        <!-- Navegación steps -->
        <div class="flex items-center justify-between pt-1">
          <button type="button" (click)="currentStep() === 1 ? volver() : prevStep()"
                  class="px-3.5 py-[7px] rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
            {{ currentStep() === 1 ? 'Cancelar' : '← Anterior' }}
          </button>
          <div class="flex gap-2">
            @if (currentStep() < 5) {
              <button type="button" (click)="nextStep()"
                      class="px-3.5 py-[7px] rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-colors">
                Siguiente →
              </button>
            } @else {
              <button type="button" (click)="guardar(false)" [disabled]="saving()"
                      class="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border border-brand-primary text-brand-primary text-xs font-semibold hover:bg-brand-light transition-colors disabled:opacity-50">
                @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> }
                Guardar borrador (CR)
              </button>
              <button type="button" (click)="guardar(true)" [disabled]="saving()"
                      class="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50">
                @if (saving()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> }
                Enviar a aprobación
              </button>
            }
          </div>
        </div>

      </form>
    </div>
  `,
})
export class NuevaOperacionPage implements OnInit {
  private readonly svc         = inject(OperacionesService);
  private readonly empresasSvc = inject(EmpresasService);
  private readonly tasasSvc    = inject(TasasService);
  private readonly router      = inject(Router);
  private readonly toast       = inject(ToastService);

  protected currentStep = signal(1);
  protected saving      = signal(false);
  protected error       = signal<string | null>(null);
  protected empresas    = signal<EmpresaListItem[]>([]);
  protected cuentasPrestamista = signal<CuentaBancaria[]>([]);
  protected cuentasPrestataria = signal<CuentaBancaria[]>([]);
  protected tasaComercial      = signal<TasaPeriodo | null>(null);
  protected avisoTramo         = signal<any | null>(null);

  protected readonly steps = [
    { num: 1, label: 'Partes' },
    { num: 2, label: 'Interés' },
    { num: 3, label: 'Cuentas' },
    { num: 4, label: 'Soporte' },
    { num: 5, label: 'Revisión' },
  ];

  protected readonly cobraInteresOpts = [
    { value: 'SI_COMERCIAL', label: 'Sí — Tasa Comercial',
      hint: 'Aplica la tasa comercial vigente del período' },
    { value: 'SI_ESPECIAL',  label: 'Sí — Tasa Especial',
      hint: 'Aplica la tasa especial negociada para la empresa prestataria' },
    { value: 'NO',           label: 'No cobra interés',
      hint: 'El préstamo no genera intereses contables (puede calcular presunto fiscal)' },
  ];

  protected readonly form = new FormGroup({
    empresaPrestamistaId: new FormControl<number | string>('', [Validators.required]),
    empresaPrestatariaId: new FormControl<number | string>('', [Validators.required]),
    cobraInteres:         new FormControl<CobraInteres | string>('', [Validators.required]),
    cuentaOrigenId:       new FormControl<number | string>(''),
    cuentaDestinoId:      new FormControl<number | string>(''),
    montoEstimado:        new FormControl(''),
    observaciones:        new FormControl('', [Validators.required, Validators.maxLength(2000)]),
    numDocumentoSoporte:  new FormControl('', [Validators.required, Validators.maxLength(60)]),
  });

  ngOnInit(): void {
    this.empresasSvc.listar({ estado: 'ACTIVA', size: 100 }).subscribe(p => this.empresas.set(p.content));
    this.tasasSvc.vigentes().subscribe(ts => {
      const comercial = ts.find(t => t.tipoTasa === 'COMERCIAL_VIGENTE');
      this.tasaComercial.set(comercial ?? null);
    });
  }

  protected err(field: string): string {
    return getErrorMessage(this.form.get(field)) ?? '';
  }

  protected empresaLabel(id: number | string | null | undefined): string {
    if (!id) return '—';
    return this.empresas().find(e => e.id === +id)?.razonSocial ?? String(id);
  }

  protected interesLabel(v: string): string {
    return v === 'SI_COMERCIAL' ? 'Sí — Comercial' : v === 'SI_ESPECIAL' ? 'Sí — Especial' : 'No cobra interés';
  }

  protected onPrestamistaChange(): void {
    const id = this.form.value.empresaPrestamistaId;
    if (id) {
      this.empresasSvc.obtener(+id).subscribe(e =>
        this.cuentasPrestamista.set(e.cuentasBancarias.filter(c => c.activa)));
    }
  }

  protected onPrestatariaChange(): void {
    const id = this.form.value.empresaPrestatariaId;
    if (id) {
      this.empresasSvc.obtener(+id).subscribe(e =>
        this.cuentasPrestataria.set(e.cuentasBancarias.filter(c => c.activa)));
      this.svc.avisoTramoAnterior(+id).subscribe(a => this.avisoTramo.set(a));
    }
  }

  protected nextStep(): void {
    const step = this.currentStep();
    if (step === 1 && (!this.form.value.empresaPrestamistaId || !this.form.value.empresaPrestatariaId)) {
      markAllAsTouched(this.form); return;
    }
    if (step === 2 && !this.form.value.cobraInteres) { markAllAsTouched(this.form); return; }
    if (step === 4 && (!this.form.value.observaciones || !this.form.value.numDocumentoSoporte)) {
      markAllAsTouched(this.form); return;
    }
    if (step < 5) this.currentStep.set(step + 1);
  }

  protected prevStep(): void {
    if (this.currentStep() > 1) this.currentStep.set(this.currentStep() - 1);
  }

  protected guardar(enviarAprobacion = false): void {
    if (this.form.invalid) { markAllAsTouched(this.form); return; }
    this.saving.set(true);
    this.error.set(null);

    const v = this.form.value;
    const request = {
      empresaPrestamistaId: +v.empresaPrestamistaId!,
      empresaPrestatariaId: +v.empresaPrestatariaId!,
      cobraInteres:    v.cobraInteres as CobraInteres,
      cuentaOrigenId:  v.cuentaOrigenId  ? +v.cuentaOrigenId  : undefined,
      cuentaDestinoId: v.cuentaDestinoId ? +v.cuentaDestinoId : undefined,
      montoEstimado:       v.montoEstimado || undefined,
      observaciones:       v.observaciones!,
      numDocumentoSoporte: v.numDocumentoSoporte!,
    };

    this.svc.crear(request).subscribe({
      next: (op) => {
        if (enviarAprobacion) {
          this.svc.enviarAprobacion(op.id).subscribe({
            next:  () => { this.saving.set(false); this.toast.success('Operación creada exitosamente'); this.router.navigate(['/operaciones', op.id]); },
            error: () => { this.saving.set(false); this.toast.success('Operación creada exitosamente'); this.router.navigate(['/operaciones', op.id]); },
          });
        } else {
          this.saving.set(false);
          this.toast.success('Operación creada exitosamente');
          this.router.navigate(['/operaciones', op.id]);
        }
      },
      error: (e) => {
        this.saving.set(false);
        const msg = e.error?.message ?? 'Error al crear la operación';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }

  protected volver(): void { this.router.navigate(['/operaciones']); }
}
