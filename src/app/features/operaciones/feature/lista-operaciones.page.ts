import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OperacionesStore } from '../data-access/operaciones.store';
import { OperacionesService } from '../data-access/operaciones.service';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { BadgeComponent, BadgeSeverity } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { PipelineStepperComponent } from '@shared/ui/stepper/stepper.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { EstadoPipeline, OperacionListItem } from '../domain/operacion.model';

@Component({
  selector: 'app-lista-operaciones',
  standalone: true,
  imports: [
    FormsModule, HasRoleDirective, BadgeComponent, ButtonComponent,
    PipelineStepperComponent, ConfirmDialogComponent, EmptyStateComponent, CurrencyCopPipe,
  ],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Operaciones</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Préstamos intercompañía en pipeline</p>
        </div>
        <app-button *hasRole="['ADMIN','TESORERIA']" (clicked)="irACrear()">
          <span class="material-symbols-outlined text-sm mr-1">add</span>
          Nueva operación
        </app-button>
      </div>

      <!-- Filtros -->
      <div class="card py-4 flex flex-wrap gap-3">
        <input [(ngModel)]="filtroRef" (ngModelChange)="onBusqueda()"
               type="search" placeholder="Buscar por referencia..."
               class="form-input w-48">
        <select [(ngModel)]="filtroEstado" (ngModelChange)="onFiltro()" class="form-input w-44">
          <option value="">Todos los estados</option>
          @for (s of estados; track s.value) {
            <option [value]="s.value">{{ s.label }}</option>
          }
        </select>
      </div>

      <!-- Tabla -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Referencia</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Prestamista</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Prestataria</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Monto Est.</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Interés</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Pipeline</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Creado</th>
                <th class="px-4 py-3 w-20 text-center font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (store.loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6,7,8]; track j) {
                    <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                  }</tr>
                }
              } @else if (store.items().length === 0) {
                <tr><td colspan="8" class="py-0">
                  <app-empty-state icon="receipt_long" title="Sin operaciones"
                                   description="Crea la primera operación para comenzar el pipeline."/>
                </td></tr>
              } @else {
                @for (op of store.items(); track op.id) {
                  <tr class="hover:bg-neutral-50 cursor-pointer transition-colors"
                      (click)="irADetalle(op.id)">
                    <td class="px-4 py-3 font-mono text-xs font-semibold text-brand-primary">
                      {{ op.referencia ?? '—' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-neutral-700 max-w-32 truncate"
                        [title]="op.empresaPrestamistaNombre">
                      {{ op.empresaPrestamistaNombre }}
                    </td>
                    <td class="px-4 py-3 text-sm text-neutral-700 max-w-32 truncate"
                        [title]="op.empresaPrestatariaNombre">
                      {{ op.empresaPrestatariaNombre }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm text-neutral-700">
                      {{ op.montoEstimado ? (op.montoEstimado | currencyCop) : '—' }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-xs" [class]="interesClass(op.cobraInteres)">
                        {{ interesLabel(op.cobraInteres) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <app-badge [label]="op.estadoPipeline" [severity]="estadoSeverity(op.estadoPipeline)"/>
                    </td>
                    <td class="px-4 py-3 text-xs text-neutral-500">{{ op.fechaCreacion }}</td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="irADetalle(op.id); $event.stopPropagation()"
                              class="text-brand-primary hover:text-brand-secondary transition-colors">
                        <span class="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        @if (store.totalPages() > 1) {
          <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-sm text-neutral-600">
            <span>Página {{ store.currentPage() }} de {{ store.totalPages() }}</span>
            <div class="flex gap-2">
              <button class="btn-secondary px-3 py-1 text-xs" [disabled]="store.currentPage() === 1"
                      (click)="store.setPage(store.currentPage()-1); store.cargar()">Anterior</button>
              <button class="btn-secondary px-3 py-1 text-xs" [disabled]="store.currentPage() === store.totalPages()"
                      (click)="store.setPage(store.currentPage()+1); store.cargar()">Siguiente</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ListaOperacionesPage implements OnInit {
  protected readonly store = inject(OperacionesStore);
  private readonly router  = inject(Router);

  protected filtroRef    = '';
  protected filtroEstado = '';
  private busquedaTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly estados = [
    { value: 'CR',        label: 'Creación' },
    { value: 'AI',        label: 'Aprobación Interna' },
    { value: 'AE',        label: 'Aceptación Empresa' },
    { value: 'FD',        label: 'Firma Digital' },
    { value: 'DS',        label: 'Desembolsado' },
    { value: 'RECHAZADA', label: 'Rechazada' },
    { value: 'CANCELADA', label: 'Cancelada' },
  ];

  ngOnInit(): void { this.store.cargar(); }

  protected irACrear():          void { this.router.navigate(['/operaciones/nueva']); }
  protected irADetalle(id: number): void { this.router.navigate(['/operaciones', id]); }

  protected onBusqueda(): void {
    if (this.busquedaTimer) clearTimeout(this.busquedaTimer);
    this.busquedaTimer = setTimeout(() => {
      this.store.setFiltros({ referencia: this.filtroRef || undefined });
      this.store.cargar();
    }, 350);
  }

  protected onFiltro(): void {
    this.store.setFiltros({ estado: this.filtroEstado || undefined });
    this.store.cargar();
  }

  protected estadoSeverity(estado: EstadoPipeline): BadgeSeverity {
    const m: Record<string, BadgeSeverity> = {
      CR: 'pending', AI: 'active', AE: 'active', FD: 'warning',
      DS: 'success', RECHAZADA: 'danger', CANCELADA: 'danger',
    };
    return m[estado] ?? 'pending';
  }

  protected interesLabel(ci: string): string {
    return ci === 'SI_COMERCIAL' ? 'Comercial' : ci === 'SI_ESPECIAL' ? 'Especial' : 'Sin interés';
  }

  protected interesClass(ci: string): string {
    return ci === 'NO' ? 'text-neutral-400' : 'text-brand-primary font-medium';
  }
}
