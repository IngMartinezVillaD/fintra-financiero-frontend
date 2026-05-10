import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmpresasStore } from '../data-access/empresas.store';
import { EmpresasService } from '../data-access/empresas.service';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-empresas-list',
  standalone: true,
  imports: [FormsModule, HasRoleDirective, BadgeComponent, ButtonComponent, ConfirmDialogComponent, EmptyStateComponent],
  template: `
    <div class="space-y-4">
      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Maestro de Empresas</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Empresas configuradas para operaciones</p>
        </div>
        <app-button *hasRole="['ADMIN']" (clicked)="irACrear()">
          <span class="material-symbols-outlined text-sm mr-1">add</span>
          Nueva empresa
        </app-button>
      </div>

      <!-- Filtros -->
      <div class="card py-4 flex flex-wrap gap-3">
        <input [(ngModel)]="busqueda" (ngModelChange)="onBusqueda()"
               type="search" placeholder="Buscar por código, razón social o NIT..."
               class="form-input w-64">
        <select [(ngModel)]="filtroEstado" (ngModelChange)="onFiltro()" class="form-input w-36">
          <option value="">Todos los estados</option>
          <option value="ACTIVA">Activa</option>
          <option value="INACTIVA">Inactiva</option>
        </select>
        <select [(ngModel)]="filtroRol" (ngModelChange)="onFiltro()" class="form-input w-40">
          <option value="">Todos los roles</option>
          <option value="PRESTAMISTA">Prestamista</option>
          <option value="PRESTATARIA">Prestataria</option>
          <option value="AMBOS">Ambos</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Código</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Razón Social</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">NIT</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Rol</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">ERP</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Estado</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Tasa</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-20">Ver</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (store.loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    @for (j of [1,2,3,4,5,6,7,8]; track j) {
                      <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                    }
                  </tr>
                }
              } @else if (store.items().length === 0) {
                <tr>
                  <td colspan="8" class="py-0">
                    <app-empty-state icon="domain" title="Sin empresas registradas"
                                     description="Crea la primera empresa para comenzar a operar."/>
                  </td>
                </tr>
              } @else {
                @for (e of store.items(); track e.id) {
                  <tr class="hover:bg-neutral-50 cursor-pointer transition-colors" (click)="irADetalle(e.id)">
                    <td class="px-4 py-3 font-mono text-xs text-neutral-600">{{ e.codigoInterno }}</td>
                    <td class="px-4 py-3 font-medium text-neutral-800">{{ e.razonSocial }}</td>
                    <td class="px-4 py-3 text-neutral-600">{{ e.nit }}</td>
                    <td class="px-4 py-3 text-neutral-600">{{ rolLabel(e.rolPermitido) }}</td>
                    <td class="px-4 py-3 text-neutral-500 text-xs">{{ e.erpUtilizado ?? '—' }}</td>
                    <td class="px-4 py-3 text-center">
                      <app-badge [label]="e.estado" [severity]="e.estado === 'ACTIVA' ? 'success' : 'pending'"/>
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (e.tieneTasaPendiente) {
                        <span class="badge-warning text-xs">Pendiente</span>
                      } @else if (e.aplicaTasaEspecial) {
                        <span class="badge-active text-xs">Especial</span>
                      } @else {
                        <span class="text-neutral-300 text-xs">—</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="irADetalle(e.id); $event.stopPropagation()"
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

        <!-- Paginación -->
        @if (store.totalPages() > 1) {
          <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-sm text-neutral-600">
            <span>Página {{ store.currentPage() }} de {{ store.totalPages() }}</span>
            <div class="flex gap-2">
              <button class="btn-secondary px-3 py-1 text-xs"
                      [disabled]="store.currentPage() === 1"
                      (click)="store.setPage(store.currentPage() - 1); store.cargar()">
                Anterior
              </button>
              <button class="btn-secondary px-3 py-1 text-xs"
                      [disabled]="store.currentPage() === store.totalPages()"
                      (click)="store.setPage(store.currentPage() + 1); store.cargar()">
                Siguiente
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Confirm inactivar -->
    <app-confirm-dialog
      [open]="confirmInactivar()"
      title="Inactivar empresa"
      message="¿Confirmas que deseas inactivar esta empresa? Se deshabilitará para nuevas operaciones."
      confirmLabel="Inactivar"
      [loading]="inactivando()"
      (confirmed)="confirmarInactivar()"
      (cancelled)="confirmInactivar.set(false)"/>
  `,
})
export class EmpresasListPage implements OnInit {
  protected readonly store = inject(EmpresasStore);
  private readonly svc    = inject(EmpresasService);
  private readonly router = inject(Router);

  protected busqueda    = '';
  protected filtroEstado = '';
  protected filtroRol    = '';
  protected confirmInactivar = signal(false);
  protected inactivando      = signal(false);
  private empresaAInactivar: number | null = null;
  private busquedaTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void { this.store.cargar(); }

  protected irACrear():        void { this.router.navigate(['/configuracion/empresas/nueva']); }
  protected irADetalle(id: number): void { this.router.navigate(['/configuracion/empresas', id]); }

  protected rolLabel(rol: string): string {
    const map: Record<string, string> = {
      PRESTAMISTA: 'Prestamista', PRESTATARIA: 'Prestataria', AMBOS: 'Ambos',
    };
    return map[rol] ?? rol;
  }

  protected onBusqueda(): void {
    if (this.busquedaTimer) clearTimeout(this.busquedaTimer);
    this.busquedaTimer = setTimeout(() => {
      this.store.setFiltros({ busqueda: this.busqueda || undefined });
      this.store.cargar();
    }, 350);
  }

  protected onFiltro(): void {
    this.store.setFiltros({
      estado: this.filtroEstado || undefined,
      rolPermitido: this.filtroRol || undefined,
    });
    this.store.cargar();
  }

  protected iniciarInactivar(id: number): void {
    this.empresaAInactivar = id;
    this.confirmInactivar.set(true);
  }

  protected confirmarInactivar(): void {
    if (!this.empresaAInactivar) return;
    this.inactivando.set(true);
    this.svc.inactivar(this.empresaAInactivar).subscribe({
      next: () => {
        this.inactivando.set(false);
        this.confirmInactivar.set(false);
        this.store.cargar();
      },
      error: () => this.inactivando.set(false),
    });
  }
}
