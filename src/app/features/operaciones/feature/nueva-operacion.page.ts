import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperacionesService } from '../data-access/operaciones.service';
import { EmpresasService } from '../../configuracion/empresas/data-access/empresas.service';
import { TasasService } from '../../configuracion/tasas-periodo/data-access/tasas.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import { getErrorMessage, markAllAsTouched } from '@shared/utils/form.utils';
import { AvisoTramoAnterior, CobraInteres } from '../domain/operacion.model';
import { EmpresaListItem, CuentaBancaria } from '../../configuracion/empresas/domain/empresa.model';
import { TasaPeriodo } from '../../configuracion/tasas-periodo/domain/tasa-periodo.model';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';

@Component({
  selector: 'app-nueva-operacion',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent, MoneyInputComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <button (click)="volver()" class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Nueva operación</h1>
          <p class="text-sm text-neutral-500">Préstamo intercompañía — Etapa CR</p>
        </div>
      </div>

      <!-- Stepper visual -->
      <div class="card py-3 px-6">
        <div class="flex gap-0">
          @for (s of steps; track s.num; let last = $last) {
            <div class="flex items-center">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                     [class]="currentStep() >= s.num ? 'bg-brand-primary text-white' : 'bg-neutral-200 text-neutral-400'">
                  {{ s.num }}
                </div>
                <span class="text-xs mt-1 w-16 text-center leading-tight"
                      [class]="currentStep() >= s.num ? 'text-neutral-700 font-medium' : 'text-neutral-400'">
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

      <form [formGroup]="form" (ngSubmit)="guardar()">

        <!-- STEP 1 — Partes -->
        @if (currentStep() === 1) {
          <div class="card space-y-4">
            <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
              Partes de la operación
            </h2>
            <div class="grid grid-cols-2 gap-4 items-end">
              <app-form-field label="Empresa Prestamista" [required]="true" [error]="err('empresaPrestamistaId')">
                <select formControlName="empresaPrestamistaId" class="form-input"
                        (change)="onPrestamistaChange()">
                  <option value="">Seleccionar...</option>
                  @for (e of empresas(); track e.id) {
                    @if (e.rolPermitido === 'PRESTAMISTA' || e.rolPermitido === 'AMBOS') {
                      <option [value]="e.id">{{ e.codigoInterno }} — {{ e.razonSocial }}</option>
                    }
                  }
                </select>
              </app-form-field>

              <div class="flex items-center justify-center pb-6">
                <span class="material-symbols-outlined text-brand-primary text-2xl">arrow_forward</span>
              </div>
            </div>
            <app-form-field label="Empresa Prestataria" [required]="true" [error]="err('empresaPrestatariaId')">
              <select formControlName="empresaPrestatariaId" class="form-input"
                      (change)="onPrestatariaChange()">
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
            </app-form-field>
          </div>
        }

        <!-- STEP 2 — Condiciones de interés -->
        @if (currentStep() === 2) {
          <div class="card space-y-4">
            <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
              Condiciones de interés
            </h2>
            <div class="space-y-3">
              @for (opt of cobraInteresOpts; track opt.value) {
                <label class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                       [class]="form.value.cobraInteres === opt.value
                         ? 'border-brand-primary bg-brand-light'
                         : 'border-neutral-200 hover:border-neutral-300'">
                  <input type="radio" formControlName="cobraInteres" [value]="opt.value"
                         class="mt-0.5 accent-brand-primary shrink-0">
                  <div>
                    <p class="font-medium text-sm text-neutral-800">{{ opt.label }}</p>
                    <p class="text-xs text-neutral-500 mt-0.5">{{ opt.hint }}</p>
                    @if (opt.value === 'SI_COMERCIAL' && tasaComercial()) {
                      <p class="text-xs text-success mt-1 font-medium">
                        Tasa vigente: {{ tasaComercial()!.valorPorcentajeEfectivoAnual }}% E.A.
                      </p>
                    }
                    @if (opt.value === 'SI_COMERCIAL' && !tasaComercial()) {
                      <p class="text-xs text-danger mt-1">⚠ No hay tasa comercial vigente</p>
                    }
                  </div>
                </label>
              }
            </div>
          </div>
        }

        <!-- STEP 3 — Cuentas y monto -->
        @if (currentStep() === 3) {
          <div class="card space-y-4">
            <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
              Cuentas bancarias y monto
            </h2>
            <app-form-field label="Cuenta origen (Prestamista)" [error]="err('cuentaOrigenId')">
              <select formControlName="cuentaOrigenId" class="form-input">
                <option value="">Sin cuenta origen</option>
                @for (c of cuentasPrestamista(); track c.id) {
                  <option [value]="c.id">
                    {{ c.bancoNombre }} — {{ c.numeroCuenta }} ({{ c.tipo }})
                    {{ c.exentaGmf ? '• Exenta GMF' : '' }}
                  </option>
                }
              </select>
            </app-form-field>
            <app-form-field label="Cuenta destino (Prestataria)" [error]="err('cuentaDestinoId')">
              <select formControlName="cuentaDestinoId" class="form-input">
                <option value="">Sin cuenta destino</option>
                @for (c of cuentasPrestataria(); track c.id) {
                  <option [value]="c.id">
                    {{ c.bancoNombre }} — {{ c.numeroCuenta }} ({{ c.tipo }})
                    {{ c.exentaGmf ? '• Exenta GMF' : '' }}
                  </option>
                }
              </select>
            </app-form-field>
            <app-form-field label="Monto estimado" hint="Referencial — el monto real se confirma en el desembolso">
              <app-money-input formControlName="montoEstimado"/>
            </app-form-field>
          </div>
        }

        <!-- STEP 4 — Soporte y observaciones -->
        @if (currentStep() === 4) {
          <div class="card space-y-4">
            <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
              Soporte documental
            </h2>
            <app-form-field label="N° Documento soporte (Campo 10 ERP)" [required]="true" [error]="err('numDocumentoSoporte')">
              <input formControlName="numDocumentoSoporte" class="form-input" placeholder="CONT-2026-018">
            </app-form-field>
            <app-form-field label="Observaciones (Campo 27 ERP)" [required]="true" [error]="err('observaciones')">
              <textarea formControlName="observaciones" class="form-input min-h-28"
                        placeholder="Préstamo para capital de trabajo Q2 2026..."></textarea>
            </app-form-field>
          </div>
        }

        <!-- STEP 5 — Revisión -->
        @if (currentStep() === 5) {
          <div class="card space-y-4">
            <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
              Revisión final
            </h2>
            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-neutral-500">Prestamista</dt>
                <dd class="font-medium text-neutral-800">{{ empresaLabel(form.value.empresaPrestamistaId) }}</dd>
              </div>
              <div>
                <dt class="text-neutral-500">Prestataria</dt>
                <dd class="font-medium text-neutral-800">{{ empresaLabel(form.value.empresaPrestatariaId) }}</dd>
              </div>
              <div>
                <dt class="text-neutral-500">Cobra interés</dt>
                <dd class="font-medium">{{ interesLabel(form.value.cobraInteres ?? '') }}</dd>
              </div>
              <div>
                <dt class="text-neutral-500">Monto estimado</dt>
                <dd class="font-medium font-mono">{{ form.value.montoEstimado ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-neutral-500">N° Soporte</dt>
                <dd class="font-medium">{{ form.value.numDocumentoSoporte }}</dd>
              </div>
            </dl>

            <!-- Aviso tramo anterior -->
            @if (avisoTramo()) {
              <div class="bg-warning-light border border-warning rounded-lg p-4 space-y-2">
                <p class="font-semibold text-warning text-sm flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">info</span>
                  Aviso — Tramo anterior activo
                </p>
                <p class="text-sm text-neutral-700">
                  La empresa prestataria tiene un crédito activo
                  ({{ avisoTramo()!.referencia }}) con saldo capital de
                  <strong>{{ avisoTramo()!.saldoCapital }}</strong>.
                </p>
                <p class="text-sm text-neutral-700">
                  Días transcurridos del tramo: <strong>{{ avisoTramo()!.diasTranscurridos }}</strong> —
                  Interés estimado causado:
                  <strong class="text-warning">{{ avisoTramo()!.interesEstimado }}</strong>
                </p>
                <p class="text-xs text-neutral-500">
                  Este interés se liquidará antes de abrir el nuevo tramo al momento del desembolso.
                </p>
              </div>
            }
          </div>
        }

        <!-- Error -->
        @if (error()) {
          <div class="bg-danger-light border border-danger/30 text-danger text-sm rounded-lg p-3" role="alert">
            {{ error() }}
          </div>
        }

        <!-- Navegación steps -->
        <div class="flex gap-3 justify-between">
          <app-button variant="ghost" type="button"
                      (clicked)="currentStep() === 1 ? volver() : prevStep()">
            {{ currentStep() === 1 ? 'Cancelar' : 'Anterior' }}
          </app-button>
          <div class="flex gap-3">
            @if (currentStep() < 5) {
              <app-button type="button" (clicked)="nextStep()">Siguiente</app-button>
            } @else {
              <app-button variant="secondary" type="button" [loading]="saving()"
                          (clicked)="guardar(false)">
                Guardar borrador (CR)
              </app-button>
              <app-button type="button" [loading]="saving()"
                          (clicked)="guardar(true)">
                Enviar a aprobación
              </app-button>
            }
          </div>
        </div>
      </form>
    </div>
  `,
})
export class NuevaOperacionPage implements OnInit {
  private readonly svc        = inject(OperacionesService);
  private readonly empresasSvc = inject(EmpresasService);
  private readonly tasasSvc   = inject(TasasService);
  private readonly router     = inject(Router);

  protected currentStep = signal(1);
  protected saving      = signal(false);
  protected error       = signal<string | null>(null);
  protected empresas    = signal<EmpresaListItem[]>([]);
  protected cuentasPrestamista = signal<CuentaBancaria[]>([]);
  protected cuentasPrestataria = signal<CuentaBancaria[]>([]);
  protected tasaComercial  = signal<TasaPeriodo | null>(null);
  protected avisoTramo     = signal<any | null>(null);

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
      cobraInteres: v.cobraInteres as CobraInteres,
      cuentaOrigenId:  v.cuentaOrigenId  ? +v.cuentaOrigenId  : undefined,
      cuentaDestinoId: v.cuentaDestinoId ? +v.cuentaDestinoId : undefined,
      montoEstimado: v.montoEstimado || undefined,
      observaciones: v.observaciones!,
      numDocumentoSoporte: v.numDocumentoSoporte!,
    };

    this.svc.crear(request).subscribe({
      next: (op) => {
        if (enviarAprobacion) {
          this.svc.enviarAprobacion(op.id).subscribe({
            next: () => { this.saving.set(false); this.router.navigate(['/operaciones', op.id]); },
            error: () => { this.saving.set(false); this.router.navigate(['/operaciones', op.id]); },
          });
        } else {
          this.saving.set(false);
          this.router.navigate(['/operaciones', op.id]);
        }
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.error?.message ?? 'Error al crear la operación');
      },
    });
  }

  protected volver(): void { this.router.navigate(['/operaciones']); }
}
