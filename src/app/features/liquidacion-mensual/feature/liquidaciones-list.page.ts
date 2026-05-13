import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LiquidacionService } from '../data-access/liquidacion.service';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import {
  LiquidacionEstado, LiquidacionMensual,
  LIQUIDACION_ESTADO_COLOR, LIQUIDACION_ESTADO_LABEL
} from '../domain/liquidacion.model';

@Component({
  selector: 'app-liquidaciones-list',
  standalone: true,
  imports: [FormsModule, CurrencyCopPipe, HasRoleDirective, EmptyStateComponent, ButtonComponent],
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Liquidación mensual</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Cierre mensual de intereses por operaciones vigentes</p>
        </div>
        <div *hasRole="['ADMIN','TESORERIA']">
          <app-button (clicked)="nuevaLiquidacion()">
            <span class="material-symbols-outlined text-sm mr-1">add</span>
            Nueva liquidación
          </app-button>
        </div>
      </div>

      <!-- Formulario nueva liquidación inline -->
      @if (mostrarFormNueva()) {
        <div class="card p-4 border-brand-primary/30 border">
          <p class="text-sm font-semibold text-neutral-700 mb-3">Nueva liquidación</p>
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="block text-xs text-neutral-500 mb-1">Año</label>
              <input type="number" [(ngModel)]="formAnio" min="2020" max="2099"
                     class="rounded border border-neutral-300 px-3 py-2 text-sm w-24"/>
            </div>
            <div>
              <label class="block text-xs text-neutral-500 mb-1">Mes</label>
              <select [(ngModel)]="formMes"
                      class="rounded border border-neutral-300 px-3 py-2 text-sm w-full sm:w-auto">
                @for (m of meses; track m.num) {
                  <option [value]="m.num">{{ m.nombre }}</option>
                }
              </select>
            </div>
            <app-button [loading]="guardando()" (clicked)="crearLiquidacion()">Crear</app-button>
            <button (click)="mostrarFormNueva.set(false)"
                    class="text-sm text-neutral-500 hover:text-neutral-700">Cancelar</button>
          </div>
          @if (errorCrear()) {
            <p class="text-sm text-red-600 mt-2">{{ errorCrear() }}</p>
          }
        </div>
      }

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Período</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Fecha corte</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Estado</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Total intereses</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Neto cobrar</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-20">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (loading()) {
                @for (i of [1,2,3]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6]; track j) {
                    <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                  }</tr>
                }
              } @else if (items().length === 0) {
                <tr><td colspan="6" class="py-0">
                  <app-empty-state icon="receipt_long" title="Sin liquidaciones"
                                   description="Crea la primera liquidación mensual."/>
                </td></tr>
              } @else {
                @for (l of items(); track l.id) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-neutral-900 capitalize">{{ l.periodo }}</td>
                    <td class="px-4 py-3 text-neutral-600">{{ l.fechaCorte }}</td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded-full font-medium"
                            [class]="estadoColor(l.estado)">
                        {{ estadoLabel(l.estado) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-neutral-900">
                      {{ l.totalInteresesLiquidados | currencyCop }}
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-green-700">
                      {{ l.totalNetoCobrar | currencyCop }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="irADetalle(l.id)"
                              class="text-brand-primary hover:text-brand-primary/80 transition-colors">
                        <span class="material-symbols-outlined text-xl">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class LiquidacionesListPage implements OnInit {
  private readonly svc    = inject(LiquidacionService);
  private readonly router = inject(Router);

  items          = signal<LiquidacionMensual[]>([]);
  loading        = signal(true);
  mostrarFormNueva = signal(false);
  guardando      = signal(false);
  errorCrear     = signal<string | null>(null);

  formAnio = new Date().getFullYear();
  formMes  = new Date().getMonth() + 1;

  meses = [
    {num:1,nombre:'Enero'},{num:2,nombre:'Febrero'},{num:3,nombre:'Marzo'},
    {num:4,nombre:'Abril'},{num:5,nombre:'Mayo'},{num:6,nombre:'Junio'},
    {num:7,nombre:'Julio'},{num:8,nombre:'Agosto'},{num:9,nombre:'Septiembre'},
    {num:10,nombre:'Octubre'},{num:11,nombre:'Noviembre'},{num:12,nombre:'Diciembre'},
  ];

  // needed for ngModel
  get FormsModule() { return null; }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.svc.listar().subscribe({
      next: d => { this.items.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  nuevaLiquidacion() { this.mostrarFormNueva.set(true); this.errorCrear.set(null); }

  crearLiquidacion() {
    this.guardando.set(true);
    this.svc.iniciar(this.formAnio, this.formMes).subscribe({
      next: liq => {
        this.guardando.set(false);
        this.mostrarFormNueva.set(false);
        this.router.navigate(['/liquidaciones-mensuales', liq.id]);
      },
      error: err => {
        this.guardando.set(false);
        this.errorCrear.set(err?.error?.message ?? 'Error al crear la liquidación');
      },
    });
  }

  irADetalle(id: number) { this.router.navigate(['/liquidaciones-mensuales', id]); }

  estadoLabel(e: string): string { return LIQUIDACION_ESTADO_LABEL[e as LiquidacionEstado] ?? e; }
  estadoColor(e: string): string { return LIQUIDACION_ESTADO_COLOR[e as LiquidacionEstado] ?? ''; }
}
