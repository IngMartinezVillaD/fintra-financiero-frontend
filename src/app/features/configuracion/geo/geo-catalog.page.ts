import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { GeoService, PaisDto, DepartamentoDto, CiudadDto } from '@shared/services/geo.service';
import { ToastService } from '@shared/services/toast.service';
import { BadgeComponent } from '@shared/ui/badge/badge.component';

type Tab  = 'paises' | 'departamentos' | 'ciudades';
type Mode = 'none'   | 'crear'         | 'editar';

@Component({
  selector: 'app-geo-catalog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, BadgeComponent],
  template: `
    <div class="space-y-4">

      <!-- Encabezado -->
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Catálogo Geográfico</h1>
        <p class="text-sm text-neutral-500 mt-0.5">Gestión de países, departamentos y ciudades</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-neutral-200">
        @for (t of tabs; track t.key) {
          <button (click)="setTab(t.key)"
                  [class]="tab() === t.key
                    ? 'border-b-2 border-brand-primary text-brand-primary font-semibold'
                    : 'text-neutral-500 hover:text-neutral-700'"
                  class="px-4 py-2 text-sm transition-colors -mb-px">
            <span class="material-symbols-outlined text-[14px] mr-1 align-middle">{{ t.icon }}</span>
            {{ t.label }}
          </button>
        }
      </div>

      <!-- ══════════════════════════════════════ PAÍSES ══════════════════════════════════════ -->
      @if (tab() === 'paises') {
        <div class="space-y-3">

          <div class="flex justify-end">
            <button class="btn-primary text-sm" (click)="abrirCrearPais()">
              <span class="material-symbols-outlined text-sm mr-1">add</span>Nuevo país
            </button>
          </div>

          <!-- Formulario crear / editar país -->
          @if (modePais() !== 'none') {
            <div class="card p-4 border-l-4 border-brand-primary space-y-4">
              <h3 class="font-semibold text-neutral-800 text-sm">
                {{ modePais() === 'crear' ? 'Nuevo país' : 'Editar país' }}
              </h3>

              <form [formGroup]="paisForm" (ngSubmit)="guardarPais()" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="field-label">Código ISO-2 <span class="text-red-500">*</span></label>
                  <input formControlName="codigoIso2" class="field-input uppercase"
                         maxlength="2" placeholder="CO">
                  @if (paisForm.get('codigoIso2')?.invalid && paisForm.get('codigoIso2')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido, exactamente 2 letras</p>
                  }
                </div>
                <div>
                  <label class="field-label">Código ISO-3 <span class="text-red-500">*</span></label>
                  <input formControlName="codigoIso3" class="field-input uppercase"
                         maxlength="3" placeholder="COL">
                  @if (paisForm.get('codigoIso3')?.invalid && paisForm.get('codigoIso3')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido, exactamente 3 letras</p>
                  }
                </div>
                <div>
                  <label class="field-label">Nombre <span class="text-red-500">*</span></label>
                  <input formControlName="nombre" class="field-input" maxlength="100" placeholder="Colombia">
                  @if (paisForm.get('nombre')?.invalid && paisForm.get('nombre')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido</p>
                  }
                </div>

                <div class="sm:col-span-3 flex gap-2 justify-end">
                  @if (errorMsg()) {
                    <p class="text-xs text-red-600 flex-1 self-center">{{ errorMsg() }}</p>
                  }
                  <button type="button" class="btn-secondary text-sm" (click)="cancelarPais()">Cancelar</button>
                  <button type="submit" class="btn-primary text-sm" [disabled]="saving()">
                    {{ saving() ? 'Guardando…' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Tabla países -->
          <div class="card p-0 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium text-neutral-600">ISO-2</th>
                    <th class="px-4 py-3 text-left font-medium text-neutral-600">ISO-3</th>
                    <th class="px-4 py-3 text-left font-medium text-neutral-600">Nombre</th>
                    <th class="px-4 py-3 text-center font-medium text-neutral-600">Estado</th>
                    <th class="px-4 py-3 text-center font-medium text-neutral-600 w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                  @if (loading()) {
                    @for (i of [1,2,3]; track i) {
                      <tr>@for (j of [1,2,3,4,5]; track j) {
                        <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                      }</tr>
                    }
                  } @else if (paises().length === 0) {
                    <tr><td colspan="5" class="px-4 py-8 text-center text-neutral-400 text-sm">Sin países registrados</td></tr>
                  } @else {
                    @for (p of paises(); track p.id) {
                      <tr class="hover:bg-neutral-50 transition-colors">
                        <td class="px-4 py-3 font-mono text-xs text-neutral-600">{{ p.codigoIso2 }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-neutral-600">{{ p.codigoIso3 }}</td>
                        <td class="px-4 py-3 font-medium text-neutral-800">{{ p.nombre }}</td>
                        <td class="px-4 py-3 text-center">
                          <app-badge [label]="p.activo ? 'Activo' : 'Inactivo'"
                                     [severity]="p.activo ? 'success' : 'pending'"/>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <div class="flex items-center justify-center gap-2">
                            <button (click)="abrirEditarPais(p)"
                                    class="text-brand-primary hover:text-brand-secondary transition-colors"
                                    title="Editar">
                              <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button (click)="togglePais(p)"
                                    [disabled]="togglingId() === p.id"
                                    class="transition-colors"
                                    [class]="p.activo ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'"
                                    [title]="p.activo ? 'Inactivar' : 'Activar'">
                              <span class="material-symbols-outlined text-base">
                                {{ p.activo ? 'toggle_on' : 'toggle_off' }}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- ════════════════════════════════════ DEPARTAMENTOS ════════════════════════════════ -->
      @if (tab() === 'departamentos') {
        <div class="space-y-3">

          <div class="flex flex-wrap items-center gap-3">
            <select [(ngModel)]="filtroPaisAdmin" (ngModelChange)="cargarDepartamentosAdmin()"
                    class="form-input w-full sm:w-48 text-sm">
              <option value="">Seleccionar país...</option>
              @for (p of paisesAdmin(); track p.id) {
                <option [value]="p.codigoIso2">{{ p.nombre }}</option>
              }
            </select>
            <div class="flex-1"></div>
            <button class="btn-primary text-sm" (click)="abrirCrearDept()" [disabled]="!filtroPaisAdmin">
              <span class="material-symbols-outlined text-sm mr-1">add</span>Nuevo departamento
            </button>
          </div>

          <!-- Formulario crear / editar departamento -->
          @if (modeDept() !== 'none') {
            <div class="card p-4 border-l-4 border-brand-primary space-y-4">
              <h3 class="font-semibold text-neutral-800 text-sm">
                {{ modeDept() === 'crear' ? 'Nuevo departamento' : 'Editar departamento' }}
              </h3>

              <form [formGroup]="deptForm" (ngSubmit)="guardarDept()" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="field-label">Código DANE <span class="text-red-500">*</span></label>
                  <input formControlName="codigoDane" class="field-input font-mono"
                         maxlength="2" placeholder="05">
                  @if (deptForm.get('codigoDane')?.invalid && deptForm.get('codigoDane')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido, exactamente 2 dígitos</p>
                  }
                </div>
                <div>
                  <label class="field-label">Nombre <span class="text-red-500">*</span></label>
                  <input formControlName="nombre" class="field-input" maxlength="100" placeholder="Antioquia">
                  @if (deptForm.get('nombre')?.invalid && deptForm.get('nombre')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido</p>
                  }
                </div>
                <div>
                  <label class="field-label">País <span class="text-red-500">*</span></label>
                  <select formControlName="paisId" class="field-input">
                    <option [value]="null">Seleccionar...</option>
                    @for (p of paisesAdmin(); track p.id) {
                      <option [value]="p.id">{{ p.nombre }}</option>
                    }
                  </select>
                  @if (deptForm.get('paisId')?.invalid && deptForm.get('paisId')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido</p>
                  }
                </div>

                <div class="sm:col-span-3 flex gap-2 justify-end">
                  @if (errorMsg()) {
                    <p class="text-xs text-red-600 flex-1 self-center">{{ errorMsg() }}</p>
                  }
                  <button type="button" class="btn-secondary text-sm" (click)="cancelarDept()">Cancelar</button>
                  <button type="submit" class="btn-primary text-sm" [disabled]="saving()">
                    {{ saving() ? 'Guardando…' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Tabla departamentos -->
          <div class="card p-0 overflow-hidden">
            @if (!filtroPaisAdmin) {
              <p class="px-4 py-8 text-center text-neutral-400 text-sm">Selecciona un país para ver sus departamentos</p>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">Cód. DANE</th>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">Nombre</th>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">País</th>
                      <th class="px-4 py-3 text-center font-medium text-neutral-600">Estado</th>
                      <th class="px-4 py-3 text-center font-medium text-neutral-600 w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100">
                    @if (loading()) {
                      @for (i of [1,2,3,4,5]; track i) {
                        <tr>@for (j of [1,2,3,4,5]; track j) {
                          <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                        }</tr>
                      }
                    } @else if (departamentos().length === 0) {
                      <tr><td colspan="5" class="px-4 py-8 text-center text-neutral-400 text-sm">Sin departamentos para este país</td></tr>
                    } @else {
                      @for (d of departamentos(); track d.id) {
                        <tr class="hover:bg-neutral-50 transition-colors">
                          <td class="px-4 py-3 font-mono text-xs text-neutral-600">{{ d.codigoDane }}</td>
                          <td class="px-4 py-3 font-medium text-neutral-800">{{ d.nombre }}</td>
                          <td class="px-4 py-3 text-neutral-500 text-xs">{{ d.paisNombre }}</td>
                          <td class="px-4 py-3 text-center">
                            <app-badge [label]="d.activo ? 'Activo' : 'Inactivo'"
                                       [severity]="d.activo ? 'success' : 'pending'"/>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <div class="flex items-center justify-center gap-2">
                              <button (click)="abrirEditarDept(d)"
                                      class="text-brand-primary hover:text-brand-secondary transition-colors"
                                      title="Editar">
                                <span class="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button (click)="toggleDept(d)"
                                      [disabled]="togglingId() === d.id"
                                      class="transition-colors"
                                      [class]="d.activo ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'"
                                      [title]="d.activo ? 'Inactivar' : 'Activar'">
                                <span class="material-symbols-outlined text-base">
                                  {{ d.activo ? 'toggle_on' : 'toggle_off' }}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════ CIUDADES ═══════════════════════════════════ -->
      @if (tab() === 'ciudades') {
        <div class="space-y-3">

          <div class="flex flex-wrap items-center gap-3">
            <select [(ngModel)]="filtroPaisCiudad" (ngModelChange)="cargarDeptsParaCiudades()"
                    class="form-input w-full sm:w-44 text-sm">
              <option value="">País...</option>
              @for (p of paisesAdmin(); track p.id) {
                <option [value]="p.codigoIso2">{{ p.nombre }}</option>
              }
            </select>
            <select [(ngModel)]="filtroDeptCiudad" (ngModelChange)="cargarCiudadesAdmin()"
                    class="form-input w-full sm:w-52 text-sm" [disabled]="!filtroPaisCiudad">
              <option value="">Departamento...</option>
              @for (d of deptsParaCiudades(); track d.id) {
                <option [value]="d.codigoDane">{{ d.nombre }}</option>
              }
            </select>
            <div class="flex-1"></div>
            <button class="btn-primary text-sm" (click)="abrirCrearCiudad()" [disabled]="!filtroDeptCiudad">
              <span class="material-symbols-outlined text-sm mr-1">add</span>Nueva ciudad
            </button>
          </div>

          <!-- Formulario crear / editar ciudad -->
          @if (modeCiudad() !== 'none') {
            <div class="card p-4 border-l-4 border-brand-primary space-y-4">
              <h3 class="font-semibold text-neutral-800 text-sm">
                {{ modeCiudad() === 'crear' ? 'Nueva ciudad' : 'Editar ciudad' }}
              </h3>

              <form [formGroup]="ciudadForm" (ngSubmit)="guardarCiudad()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="field-label">Código DANE <span class="text-red-500">*</span></label>
                  <input formControlName="codigoDane" class="field-input font-mono"
                         maxlength="5" placeholder="05001">
                  @if (ciudadForm.get('codigoDane')?.invalid && ciudadForm.get('codigoDane')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido, exactamente 5 dígitos</p>
                  }
                </div>
                <div>
                  <label class="field-label">Nombre <span class="text-red-500">*</span></label>
                  <input formControlName="nombre" class="field-input" maxlength="150" placeholder="Medellín">
                  @if (ciudadForm.get('nombre')?.invalid && ciudadForm.get('nombre')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido</p>
                  }
                </div>
                <div>
                  <label class="field-label">Código postal</label>
                  <input formControlName="codigoPostal" class="field-input font-mono"
                         maxlength="6" placeholder="050001">
                  @if (ciudadForm.get('codigoPostal')?.invalid && ciudadForm.get('codigoPostal')?.touched) {
                    <p class="text-xs text-red-500 mt-1">6 dígitos numéricos</p>
                  }
                </div>
                <div>
                  <label class="field-label">Departamento <span class="text-red-500">*</span></label>
                  <select formControlName="departamentoId" class="field-input">
                    <option [value]="null">Seleccionar...</option>
                    @for (d of deptsParaCiudades(); track d.id) {
                      <option [value]="d.id">{{ d.nombre }}</option>
                    }
                  </select>
                  @if (ciudadForm.get('departamentoId')?.invalid && ciudadForm.get('departamentoId')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Requerido</p>
                  }
                </div>

                <div class="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end">
                  @if (errorMsg()) {
                    <p class="text-xs text-red-600 flex-1 self-center">{{ errorMsg() }}</p>
                  }
                  <button type="button" class="btn-secondary text-sm" (click)="cancelarCiudad()">Cancelar</button>
                  <button type="submit" class="btn-primary text-sm" [disabled]="saving()">
                    {{ saving() ? 'Guardando…' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Tabla ciudades -->
          <div class="card p-0 overflow-hidden">
            @if (!filtroDeptCiudad) {
              <p class="px-4 py-8 text-center text-neutral-400 text-sm">
                {{ !filtroPaisCiudad ? 'Selecciona un país y departamento para ver sus ciudades' : 'Selecciona un departamento para ver sus ciudades' }}
              </p>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">Cód. DANE</th>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">Nombre</th>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">Cód. Postal</th>
                      <th class="px-4 py-3 text-left font-medium text-neutral-600">Departamento</th>
                      <th class="px-4 py-3 text-center font-medium text-neutral-600">Estado</th>
                      <th class="px-4 py-3 text-center font-medium text-neutral-600 w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100">
                    @if (loading()) {
                      @for (i of [1,2,3,4,5]; track i) {
                        <tr>@for (j of [1,2,3,4,5,6]; track j) {
                          <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                        }</tr>
                      }
                    } @else if (ciudades().length === 0) {
                      <tr><td colspan="6" class="px-4 py-8 text-center text-neutral-400 text-sm">Sin ciudades para este departamento</td></tr>
                    } @else {
                      @for (c of ciudades(); track c.id) {
                        <tr class="hover:bg-neutral-50 transition-colors">
                          <td class="px-4 py-3 font-mono text-xs text-neutral-600">{{ c.codigoDane }}</td>
                          <td class="px-4 py-3 font-medium text-neutral-800">{{ c.nombre }}</td>
                          <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ c.codigoPostal || '—' }}</td>
                          <td class="px-4 py-3 text-neutral-500 text-xs">{{ c.departamentoNombre }}</td>
                          <td class="px-4 py-3 text-center">
                            <app-badge [label]="c.activo ? 'Activo' : 'Inactivo'"
                                       [severity]="c.activo ? 'success' : 'pending'"/>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <div class="flex items-center justify-center gap-2">
                              <button (click)="abrirEditarCiudad(c)"
                                      class="text-brand-primary hover:text-brand-secondary transition-colors"
                                      title="Editar">
                                <span class="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button (click)="toggleCiudad(c)"
                                      [disabled]="togglingId() === c.id"
                                      class="transition-colors"
                                      [class]="c.activo ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'"
                                      [title]="c.activo ? 'Inactivar' : 'Activar'">
                                <span class="material-symbols-outlined text-base">
                                  {{ c.activo ? 'toggle_on' : 'toggle_off' }}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `,
})
export class GeoCatalogPage implements OnInit {
  private readonly geo   = inject(GeoService);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly tabs = [
    { key: 'paises'        as Tab, label: 'Países',        icon: 'public'       },
    { key: 'departamentos' as Tab, label: 'Departamentos',  icon: 'map'          },
    { key: 'ciudades'      as Tab, label: 'Ciudades',       icon: 'location_city'},
  ];

  protected tab = signal<Tab>('paises');

  // ── Datos ──────────────────────────────────────────────────────────────
  protected paises          = signal<PaisDto[]>([]);
  protected paisesAdmin     = signal<PaisDto[]>([]);
  protected departamentos   = signal<DepartamentoDto[]>([]);
  protected deptsParaCiudades = signal<DepartamentoDto[]>([]);
  protected ciudades        = signal<CiudadDto[]>([]);

  // ── Filtros ────────────────────────────────────────────────────────────
  protected filtroPaisAdmin  = '';
  protected filtroPaisCiudad = '';
  protected filtroDeptCiudad = '';

  // ── Estado ─────────────────────────────────────────────────────────────
  protected loading    = signal(false);
  protected saving     = signal(false);
  protected togglingId = signal<number | null>(null);
  protected errorMsg   = signal('');

  protected modePais   = signal<Mode>('none');
  protected modeDept   = signal<Mode>('none');
  protected modeCiudad = signal<Mode>('none');

  private editingPaisId:   number | null = null;
  private editingDeptId:   number | null = null;
  private editingCiudadId: number | null = null;

  // ── Formularios ────────────────────────────────────────────────────────
  protected paisForm = this.fb.group({
    codigoIso2: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    codigoIso3: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    nombre:     ['', [Validators.required, Validators.maxLength(100)]],
  });

  protected deptForm = this.fb.group({
    codigoDane: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    nombre:     ['', [Validators.required, Validators.maxLength(100)]],
    paisId:     [null as number | null, Validators.required],
  });

  protected ciudadForm = this.fb.group({
    codigoDane:     ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
    nombre:         ['', [Validators.required, Validators.maxLength(150)]],
    codigoPostal:   ['', [Validators.pattern(/^\d{6}$/)]],
    departamentoId: [null as number | null, Validators.required],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarPaises();
  }

  // ── Tab ────────────────────────────────────────────────────────────────
  protected setTab(t: Tab): void {
    this.tab.set(t);
    this.errorMsg.set('');
    if (t === 'departamentos' || t === 'ciudades') {
      if (this.paisesAdmin().length === 0) this.cargarPaisesAdmin();
    }
  }

  // ── Países — carga ─────────────────────────────────────────────────────
  private cargarPaises(): void {
    this.loading.set(true);
    this.geo.paisesAdmin().subscribe({
      next: data => { this.paises.set(data); this.paisesAdmin.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private cargarPaisesAdmin(): void {
    this.geo.paisesAdmin().subscribe({ next: data => this.paisesAdmin.set(data) });
  }

  // ── Departamentos — carga ──────────────────────────────────────────────
  protected cargarDepartamentosAdmin(): void {
    if (!this.filtroPaisAdmin) { this.departamentos.set([]); return; }
    this.loading.set(true);
    this.geo.departamentosAdmin(this.filtroPaisAdmin).subscribe({
      next: data => { this.departamentos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Ciudades — carga ───────────────────────────────────────────────────
  protected cargarDeptsParaCiudades(): void {
    this.filtroDeptCiudad = '';
    this.ciudades.set([]);
    this.deptsParaCiudades.set([]);
    if (!this.filtroPaisCiudad) return;
    this.geo.departamentosAdmin(this.filtroPaisCiudad).subscribe({
      next: data => this.deptsParaCiudades.set(data),
    });
  }

  protected cargarCiudadesAdmin(): void {
    if (!this.filtroDeptCiudad) { this.ciudades.set([]); return; }
    this.loading.set(true);
    this.geo.ciudadesAdmin(this.filtroDeptCiudad).subscribe({
      next: data => { this.ciudades.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── PAÍSES — CRUD ──────────────────────────────────────────────────────
  protected abrirCrearPais(): void {
    this.editingPaisId = null;
    this.paisForm.reset();
    this.errorMsg.set('');
    this.modePais.set('crear');
  }

  protected abrirEditarPais(p: PaisDto): void {
    this.editingPaisId = p.id;
    this.paisForm.setValue({ codigoIso2: p.codigoIso2, codigoIso3: p.codigoIso3, nombre: p.nombre });
    this.errorMsg.set('');
    this.modePais.set('editar');
  }

  protected cancelarPais(): void { this.modePais.set('none'); this.errorMsg.set(''); }

  protected guardarPais(): void {
    if (this.paisForm.invalid) { this.paisForm.markAllAsTouched(); return; }
    const v = this.paisForm.value as { codigoIso2: string; codigoIso3: string; nombre: string };
    this.saving.set(true);
    this.errorMsg.set('');

    const obs = this.editingPaisId == null
      ? this.geo.crearPais(v)
      : this.geo.actualizarPais(this.editingPaisId, v);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.modePais.set('none');
        this.toast.success(this.editingPaisId == null ? 'País creado exitosamente' : 'País actualizado exitosamente');
        this.cargarPaises();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar';
        this.errorMsg.set(msg);
        this.toast.error(msg);
      },
    });
  }

  protected togglePais(p: PaisDto): void {
    this.togglingId.set(p.id);
    this.geo.estadoPais(p.id, !p.activo).subscribe({
      next: () => { this.togglingId.set(null); this.cargarPaises(); },
      error: () => this.togglingId.set(null),
    });
  }

  // ── DEPARTAMENTOS — CRUD ───────────────────────────────────────────────
  protected abrirCrearDept(): void {
    this.editingDeptId = null;
    const paisSeleccionado = this.paisesAdmin().find(p => p.codigoIso2 === this.filtroPaisAdmin);
    this.deptForm.reset({ codigoDane: '', nombre: '', paisId: paisSeleccionado?.id ?? null });
    this.errorMsg.set('');
    this.modeDept.set('crear');
  }

  protected abrirEditarDept(d: DepartamentoDto): void {
    this.editingDeptId = d.id;
    this.deptForm.setValue({ codigoDane: d.codigoDane, nombre: d.nombre, paisId: d.paisId ?? null });
    this.errorMsg.set('');
    this.modeDept.set('editar');
  }

  protected cancelarDept(): void { this.modeDept.set('none'); this.errorMsg.set(''); }

  protected guardarDept(): void {
    if (this.deptForm.invalid) { this.deptForm.markAllAsTouched(); return; }
    const v = this.deptForm.value as { codigoDane: string; nombre: string; paisId: number };
    this.saving.set(true);
    this.errorMsg.set('');

    const obs = this.editingDeptId == null
      ? this.geo.crearDepartamento(v)
      : this.geo.actualizarDepartamento(this.editingDeptId, v);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.modeDept.set('none');
        this.toast.success(this.editingDeptId == null ? 'Departamento creado exitosamente' : 'Departamento actualizado exitosamente');
        this.cargarDepartamentosAdmin();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar';
        this.errorMsg.set(msg);
        this.toast.error(msg);
      },
    });
  }

  protected toggleDept(d: DepartamentoDto): void {
    this.togglingId.set(d.id);
    this.geo.estadoDepartamento(d.id, !d.activo).subscribe({
      next: () => { this.togglingId.set(null); this.cargarDepartamentosAdmin(); },
      error: () => this.togglingId.set(null),
    });
  }

  // ── CIUDADES — CRUD ────────────────────────────────────────────────────
  protected abrirCrearCiudad(): void {
    this.editingCiudadId = null;
    const deptSeleccionado = this.deptsParaCiudades().find(d => d.codigoDane === this.filtroDeptCiudad);
    this.ciudadForm.reset({ codigoDane: '', nombre: '', codigoPostal: '', departamentoId: deptSeleccionado?.id ?? null });
    this.errorMsg.set('');
    this.modeCiudad.set('crear');
  }

  protected abrirEditarCiudad(c: CiudadDto): void {
    this.editingCiudadId = c.id;
    this.ciudadForm.setValue({
      codigoDane:     c.codigoDane,
      nombre:         c.nombre,
      codigoPostal:   c.codigoPostal ?? '',
      departamentoId: c.departamentoId ?? null,
    });
    this.errorMsg.set('');
    this.modeCiudad.set('editar');
  }

  protected cancelarCiudad(): void { this.modeCiudad.set('none'); this.errorMsg.set(''); }

  protected guardarCiudad(): void {
    if (this.ciudadForm.invalid) { this.ciudadForm.markAllAsTouched(); return; }
    const v = this.ciudadForm.value as { codigoDane: string; nombre: string; codigoPostal: string; departamentoId: number };
    this.saving.set(true);
    this.errorMsg.set('');

    const body = { ...v, codigoPostal: v.codigoPostal || undefined };

    const obs = this.editingCiudadId == null
      ? this.geo.crearCiudad(body)
      : this.geo.actualizarCiudad(this.editingCiudadId, body);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.modeCiudad.set('none');
        this.toast.success(this.editingCiudadId == null ? 'Ciudad creada exitosamente' : 'Ciudad actualizada exitosamente');
        this.cargarCiudadesAdmin();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar';
        this.errorMsg.set(msg);
        this.toast.error(msg);
      },
    });
  }

  protected toggleCiudad(c: CiudadDto): void {
    this.togglingId.set(c.id);
    this.geo.estadoCiudad(c.id, !c.activo).subscribe({
      next: () => { this.togglingId.set(null); this.cargarCiudadesAdmin(); },
      error: () => this.togglingId.set(null),
    });
  }
}
