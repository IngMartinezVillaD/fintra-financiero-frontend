import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresasService } from '../data-access/empresas.service';
import { EmpresasStore } from '../data-access/empresas.store';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import { getErrorMessage, markAllAsTouched } from '@shared/utils/form.utils';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Encabezado -->
      <div class="flex items-center gap-3">
        <button (click)="volver()" class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-xl font-bold text-neutral-900">{{ esNueva() ? 'Nueva empresa' : 'Editar empresa' }}</h1>
          <p class="text-sm text-neutral-500">{{ esNueva() ? 'Registra una nueva empresa en el sistema' : 'Actualiza los datos de la empresa' }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">

        <!-- Datos básicos -->
        <div class="card space-y-4">
          <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">Datos generales</h2>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Código interno" [required]="true" [error]="err('codigoInterno')">
              <input formControlName="codigoInterno" class="form-input" placeholder="EMP-01"
                     [readonly]="!esNueva()">
            </app-form-field>
            <app-form-field label="NIT" [required]="true" [error]="err('nit')">
              <input formControlName="nit" class="form-input" placeholder="900123456-7">
            </app-form-field>
          </div>
          <app-form-field label="Razón social" [required]="true" [error]="err('razonSocial')">
            <input formControlName="razonSocial" class="form-input" placeholder="Nombre legal de la empresa">
          </app-form-field>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Rol permitido" [required]="true" [error]="err('rolPermitido')">
              <select formControlName="rolPermitido" class="form-input">
                <option value="">Seleccionar...</option>
                <option value="PRESTAMISTA">Prestamista</option>
                <option value="PRESTATARIA">Prestataria</option>
                <option value="AMBOS">Ambos</option>
              </select>
            </app-form-field>
            <app-form-field label="ERP utilizado" [error]="err('erpUtilizado')">
              <select formControlName="erpUtilizado" class="form-input">
                <option value="">Sin ERP</option>
                <option value="APOTHEOSYS">Apotheosys</option>
                <option value="SIIGO">Siigo</option>
              </select>
            </app-form-field>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="País" [error]="err('pais')">
              <input formControlName="pais" class="form-input" placeholder="Colombia">
            </app-form-field>
            <app-form-field label="Ciudad" [error]="err('ciudad')">
              <input formControlName="ciudad" class="form-input" placeholder="Bogotá">
            </app-form-field>
          </div>
        </div>

        <!-- Representante legal -->
        <div class="card space-y-4">
          <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">Representante legal</h2>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Nombre" [error]="err('representanteLegalNombre')">
              <input formControlName="representanteLegalNombre" class="form-input">
            </app-form-field>
            <app-form-field label="Correo electrónico" [error]="err('representanteLegalEmail')">
              <input formControlName="representanteLegalEmail" class="form-input" type="email">
            </app-form-field>
          </div>
          <app-form-field label="Teléfono" [error]="err('representanteLegalTelefono')">
            <input formControlName="representanteLegalTelefono" class="form-input" placeholder="+57 310 000 0000">
          </app-form-field>
        </div>

        <!-- Configuración fiscal y operativa -->
        <div class="card space-y-4">
          <h2 class="text-base font-semibold text-neutral-800 border-b border-neutral-100 pb-3">Configuración fiscal y operativa</h2>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field label="Retención en la fuente (%)" [error]="err('retencionFuentePorcentaje')">
              <input formControlName="retencionFuentePorcentaje" class="form-input" type="number" step="0.01" min="0" max="100">
            </app-form-field>
            <app-form-field label="Retención ICA (%)" [error]="err('retencionIcaPorcentaje')">
              <input formControlName="retencionIcaPorcentaje" class="form-input" type="number" step="0.01" min="0" max="100">
            </app-form-field>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <app-form-field label="Saldo inicial capital" [error]="err('saldoInicialCapital')">
              <input formControlName="saldoInicialCapital" class="form-input" type="number" step="0.01" min="0">
            </app-form-field>
            <app-form-field label="Saldo inicial intereses" [error]="err('saldoInicialIntereses')">
              <input formControlName="saldoInicialIntereses" class="form-input" type="number" step="0.01" min="0">
            </app-form-field>
            <app-form-field label="Fecha corte saldo" [error]="err('fechaCorteSaldoInicial')">
              <input formControlName="fechaCorteSaldoInicial" class="form-input" type="date">
            </app-form-field>
          </div>

          <!-- Flags -->
          <div class="space-y-3 pt-2">
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" formControlName="cobraInteres" class="w-4 h-4 rounded border-neutral-300 text-brand-primary">
              <span class="text-sm font-medium text-neutral-700">Cobra interés</span>
            </label>
            @if (form.value.cobraInteres) {
              <label class="flex items-center gap-3 cursor-pointer select-none ml-6">
                <input type="checkbox" formControlName="calculaInteresPresunto" class="w-4 h-4 rounded border-neutral-300 text-brand-primary">
                <span class="text-sm font-medium text-neutral-700">Calcula interés presunto</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer select-none ml-6">
                <input type="checkbox" formControlName="aplicaTasaEspecial" class="w-4 h-4 rounded border-neutral-300 text-brand-primary">
                <span class="text-sm font-medium text-neutral-700">Aplica tasa especial</span>
              </label>
            }
          </div>
        </div>

        <!-- Error general -->
        @if (error()) {
          <div class="bg-danger-light border border-danger/30 text-danger text-sm rounded-lg p-3" role="alert">
            {{ error() }}
          </div>
        }

        <!-- Acciones -->
        <div class="flex gap-3 justify-end">
          <app-button variant="ghost" type="button" (clicked)="volver()">Cancelar</app-button>
          <app-button type="submit" [loading]="saving()">
            {{ esNueva() ? 'Crear empresa' : 'Guardar cambios' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
})
export class EmpresaFormPage implements OnInit {
  private readonly svc    = inject(EmpresasService);
  private readonly store  = inject(EmpresasStore);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  protected esNueva = signal(true);
  protected saving  = signal(false);
  protected error   = signal<string | null>(null);
  private empresaId: number | null = null;

  protected readonly form = new FormGroup({
    codigoInterno:              new FormControl('', [Validators.required, Validators.pattern(/^EMP-\d{2,3}$/)]),
    razonSocial:                new FormControl('', [Validators.required, Validators.maxLength(200)]),
    nit:                        new FormControl('', [Validators.required, Validators.maxLength(20)]),
    pais:                       new FormControl('Colombia'),
    ciudad:                     new FormControl(''),
    rolPermitido:               new FormControl('', [Validators.required]),
    erpUtilizado:               new FormControl(''),
    representanteLegalNombre:   new FormControl(''),
    representanteLegalEmail:    new FormControl('', [Validators.email]),
    representanteLegalTelefono: new FormControl(''),
    retencionFuentePorcentaje:  new FormControl<number | null>(null),
    retencionIcaPorcentaje:     new FormControl<number | null>(null),
    saldoInicialCapital:        new FormControl(0),
    saldoInicialIntereses:      new FormControl(0),
    fechaCorteSaldoInicial:     new FormControl(''),
    cobraInteres:               new FormControl(false),
    calculaInteresPresunto:     new FormControl(false),
    aplicaTasaEspecial:         new FormControl(false),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.esNueva.set(false);
      this.empresaId = +id;
      this.store.cargarDetalle(this.empresaId);
      this.cargarFormulario();
    }
  }

  private cargarFormulario(): void {
    const sub = this.store.selected;
    if (sub?.()) {
      const e = sub()!;
      this.form.patchValue({
        codigoInterno: e.codigoInterno,
        razonSocial:   e.razonSocial,
        nit:           e.nit,
        pais:          e.pais,
        ciudad:        e.ciudad ?? '',
        rolPermitido:  e.rolPermitido,
        erpUtilizado:  e.erpUtilizado ?? '',
        representanteLegalNombre:   e.representanteLegalNombre ?? '',
        representanteLegalEmail:    e.representanteLegalEmail ?? '',
        representanteLegalTelefono: e.representanteLegalTelefono ?? '',
        cobraInteres:           e.cobraInteres,
        calculaInteresPresunto: e.calculaInteresPresunto,
        aplicaTasaEspecial:     e.aplicaTasaEspecial,
      });
      this.form.get('codigoInterno')?.disable();
    }
  }

  protected err(field: string): string {
    return getErrorMessage(this.form.get(field)) ?? '';
  }

  protected guardar(): void {
    if (this.form.invalid) { markAllAsTouched(this.form); return; }
    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const payload = {
      ...value,
      erpUtilizado: value.erpUtilizado || undefined,
      ciudad:       value.ciudad || undefined,
    };

    const req$ = this.esNueva()
      ? this.svc.crear(payload as any)
      : this.svc.actualizar(this.empresaId!, payload as any);

    req$.subscribe({
      next: (empresa) => {
        this.saving.set(false);
        this.router.navigate(['/configuracion/empresas', empresa.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar la empresa');
      },
    });
  }

  protected volver(): void {
    this.router.navigate(['/configuracion/empresas']);
  }
}
