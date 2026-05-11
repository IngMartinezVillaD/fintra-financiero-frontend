import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlesService } from '../data-access/controles.service';
import { DrawerComponent } from '@shared/ui/drawer/drawer.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { PresuntoEmpresa, MESES } from '../domain/controles.model';

@Component({
  selector: 'app-presunto-control',
  standalone: true,
  imports: [FormsModule, DrawerComponent, CurrencyCopPipe, HasRoleDirective, ButtonComponent, EmptyStateComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Interés presunto fiscal</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Control extracontable para depuración DIAN — nunca genera asiento</p>
        </div>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="anio" (ngModelChange)="cargar()"
                  class="rounded border border-neutral-300 px-3 py-2 text-sm">
            @for (a of anios; track a) { <option [value]="a">{{ a }}</option> }
          </select>
          <div *hasRole="['ADMIN','TESORERIA']">
            <app-button [loading]="ejecutando()" (clicked)="ejecutarMes()">
              <span class="material-symbols-outlined text-sm mr-1">play_arrow</span>
              Calcular mes actual
            </app-button>
          </div>
        </div>
      </div>

      @if (mensajeEjecucion()) {
        <div class="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
          {{ mensajeEjecucion() }}
        </div>
      }

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Empresa</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Total presunto {{ anio }}</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Registros</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-24">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (loading()) {
                @for (i of [1,2,3]; track i) {
                  <tr>@for (j of [1,2,3,4]; track j) {
                    <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                  }</tr>
                }
              } @else if (items().length === 0) {
                <tr><td colspan="4" class="py-0">
                  <app-empty-state icon="percent" title="Sin registros"
                                   description="No hay interés presunto para el año seleccionado. Ejecuta el cálculo del mes actual."/>
                </td></tr>
              } @else {
                @for (emp of items(); track emp.empresaId) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-neutral-900">{{ emp.razonSocial }}</td>
                    <td class="px-4 py-3 text-right font-bold text-neutral-900">
                      {{ emp.totalPresuntoAnual | currencyCop }}
                    </td>
                    <td class="px-4 py-3 text-center text-neutral-500">{{ emp.mensual.length }}</td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="verDetalle(emp)"
                              class="text-brand-primary hover:text-brand-primary/80 text-xs">
                        Ver
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

    <!-- Drawer detalle mensual -->
    <app-drawer [open]="!!selectedEmp()"
                title="{{ selectedEmp()?.razonSocial ?? '' }} — Presunto {{ anio }}"
                (closed)="selectedEmp.set(null)">
      @if (selectedEmp()) {
        <div class="space-y-3">
          <div class="flex justify-between text-sm font-semibold border-b pb-2">
            <span>Total anual</span>
            <span class="font-bold">{{ selectedEmp()!.totalPresuntoAnual | currencyCop }}</span>
          </div>
          @for (m of selectedEmp()!.mensual; track m.id) {
            <div class="rounded-lg bg-neutral-50 p-3 text-sm space-y-1">
              <div class="flex justify-between font-medium">
                <span>{{ meses[m.mes] }} · {{ m.referencia ?? 'Op. '+m.operacionId }}</span>
                <span class="text-neutral-900">{{ m.montoCalculado | currencyCop }}</span>
              </div>
              <div class="text-xs text-neutral-400">
                Saldo prom: {{ m.saldoCapitalPromedio | currencyCop }} ·
                Tasa: {{ m.tasaPresuntaPorcentaje }}% EM ·
                {{ m.dias }} días
              </div>
            </div>
          }
        </div>
      }
    </app-drawer>
  `,
})
export class PresuntoControlPage implements OnInit {
  private readonly svc = inject(ControlesService);

  items           = signal<PresuntoEmpresa[]>([]);
  loading         = signal(true);
  selectedEmp     = signal<PresuntoEmpresa | null>(null);
  ejecutando      = signal(false);
  mensajeEjecucion = signal<string | null>(null);

  anio = new Date().getFullYear();
  anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  meses = MESES;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.svc.consolidadoPresunto(this.anio).subscribe({
      next: d => { this.items.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  verDetalle(emp: PresuntoEmpresa) { this.selectedEmp.set(emp); }

  ejecutarMes() {
    const hoy = new Date();
    this.ejecutando.set(true);
    this.svc.ejecutarPresunto(hoy.getFullYear(), hoy.getMonth() + 1).subscribe({
      next: msg => {
        this.ejecutando.set(false);
        this.mensajeEjecucion.set(msg as unknown as string);
        setTimeout(() => this.mensajeEjecucion.set(null), 4000);
        this.cargar();
      },
      error: err => {
        this.ejecutando.set(false);
        this.mensajeEjecucion.set(err?.error?.message ?? 'Error al ejecutar');
      },
    });
  }
}
