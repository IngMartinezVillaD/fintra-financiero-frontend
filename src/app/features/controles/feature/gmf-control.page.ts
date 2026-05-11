import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlesService } from '../data-access/controles.service';
import { DrawerComponent } from '@shared/ui/drawer/drawer.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { GmfEmpresa, DECISION_COLOR, MESES } from '../domain/controles.model';

@Component({
  selector: 'app-gmf-control',
  standalone: true,
  imports: [FormsModule, DrawerComponent, CurrencyCopPipe, HasRoleDirective, EmptyStateComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Control GMF (4×1000)</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Registro extracontable — nunca genera asiento contable</p>
        </div>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="anio" (ngModelChange)="cargar()"
                  class="rounded border border-neutral-300 px-3 py-2 text-sm">
            @for (a of anios; track a) { <option [value]="a">{{ a }}</option> }
          </select>
        </div>
      </div>

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Empresa</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Total GMF</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Decisión anual</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-32">Acciones</th>
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
                  <app-empty-state icon="receipt" title="Sin movimientos GMF"
                                   description="No hay GMF registrado para el año seleccionado."/>
                </td></tr>
              } @else {
                @for (emp of items(); track emp.empresaId) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-neutral-900">{{ emp.razonSocial }}</td>
                    <td class="px-4 py-3 text-right font-medium text-neutral-900">
                      {{ emp.totalGmf | currencyCop }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded-full font-medium"
                            [class]="decisionColor(emp.decisionAnual)">
                        {{ emp.decisionAnual }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center flex items-center justify-center gap-2">
                      <button (click)="verDetalle(emp)"
                              class="text-brand-primary hover:text-brand-primary/80 text-xs">
                        Detalle
                      </button>
                      @if (emp.decisionAnual === 'PENDIENTE') {
                        <div *hasRole="['ADMIN','TESORERIA']">
                          <button (click)="abrirDecision(emp)"
                                  class="text-xs text-amber-600 hover:text-amber-800">
                            Decidir
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Drawer detalle -->
    <app-drawer [open]="!!selectedEmp()" title="{{ selectedEmp()?.razonSocial ?? '' }} — GMF {{ anio }}"
                (closed)="selectedEmp.set(null)">
      @if (selectedEmp()) {
        <div class="space-y-3">
          <div class="flex justify-between text-sm font-semibold border-b pb-2">
            <span>Total GMF {{ anio }}</span>
            <span>{{ selectedEmp()!.totalGmf | currencyCop }}</span>
          </div>
          @for (mov of selectedEmp()!.movimientos; track mov.id) {
            <div class="flex justify-between text-sm">
              <span class="text-neutral-500">{{ meses[mov.mes] }} — {{ mov.referencia ?? 'Op. '+mov.operacionId }}</span>
              <span class="font-medium">{{ mov.montoGmf | currencyCop }}</span>
            </div>
          }
        </div>
      }
    </app-drawer>

    <!-- Modal decisión -->
    @if (empDecision()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
          <h2 class="text-lg font-bold mb-2">Decisión anual GMF</h2>
          <p class="text-sm text-neutral-600 mb-4">
            {{ empDecision()!.razonSocial }} · Total: {{ empDecision()!.totalGmf | currencyCop }}
          </p>
          <p class="text-xs text-amber-700 bg-amber-50 rounded p-2 mb-4">
            Esta decisión es <strong>irreversible</strong>.
          </p>
          <div class="flex gap-3">
            <button (click)="registrarDecision('COBRAR')"
                    class="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium
                           hover:bg-amber-600 transition-colors">
              Cobrar a empresa
            </button>
            <button (click)="registrarDecision('ASUMIR')"
                    class="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium
                           hover:bg-blue-600 transition-colors">
              Asumir (gasto Fintra)
            </button>
          </div>
          <button (click)="empDecision.set(null)"
                  class="mt-3 w-full text-sm text-neutral-500 hover:text-neutral-700">
            Cancelar
          </button>
          @if (errorDecision()) {
            <p class="text-xs text-red-600 mt-2">{{ errorDecision() }}</p>
          }
        </div>
      </div>
    }
  `,
})
export class GmfControlPage implements OnInit {
  private readonly svc = inject(ControlesService);

  items        = signal<GmfEmpresa[]>([]);
  loading      = signal(true);
  selectedEmp  = signal<GmfEmpresa | null>(null);
  empDecision  = signal<GmfEmpresa | null>(null);
  errorDecision = signal<string | null>(null);

  anio = new Date().getFullYear();
  anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  meses = MESES;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.svc.consolidadoGmf(this.anio).subscribe({
      next: d => { this.items.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  verDetalle(emp: GmfEmpresa) { this.selectedEmp.set(emp); }
  abrirDecision(emp: GmfEmpresa) { this.empDecision.set(emp); this.errorDecision.set(null); }

  registrarDecision(decision: string) {
    const emp = this.empDecision()!;
    this.svc.registrarDecisionGmf(emp.empresaId, this.anio, decision).subscribe({
      next: () => { this.empDecision.set(null); this.cargar(); },
      error: err => this.errorDecision.set(err?.error?.message ?? 'Error al registrar'),
    });
  }

  decisionColor(d: string): string { return (DECISION_COLOR as Record<string, string>)[d] ?? ''; }
}
