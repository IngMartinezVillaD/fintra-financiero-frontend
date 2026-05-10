import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TasasStore } from '../data-access/tasas.store';
import { TasasService } from '../data-access/tasas.service';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { MESES, TasaPeriodo, TIPO_TASA_LABEL } from '../domain/tasa-periodo.model';
import { BadgeSeverity } from '@shared/ui/badge/badge.component';

@Component({
  selector: 'app-tasas-list',
  standalone: true,
  imports: [HasRoleDirective, BadgeComponent, ButtonComponent, ConfirmDialogComponent, EmptyStateComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Tasas por Período</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Usura, Comercial vigente y Presunta fiscal mensuales</p>
        </div>
        <app-button *hasRole="['ADMIN','TESORERIA']" (clicked)="irAForm()">
          <span class="material-symbols-outlined text-sm mr-1">add</span>
          Registrar tasas
        </app-button>
      </div>

      <!-- Tasas vigentes hoy -->
      @if (!store.loading() && vigentesHoy().length > 0) {
        <div class="grid grid-cols-3 gap-4">
          @for (t of vigentesHoy(); track t.id) {
            <div class="card py-4">
              <p class="text-xs font-medium text-neutral-500 uppercase tracking-wide">{{ tipoLabel(t.tipoTasa) }}</p>
              <p class="text-2xl font-bold text-brand-primary mt-1">{{ t.valorPorcentajeEfectivoAnual }}% E.A.</p>
              <p class="text-sm text-neutral-500">{{ t.valorPorcentajeMensual }}% E.M.</p>
              <p class="text-xs text-neutral-400 mt-2">Hasta: {{ t.vigenciaHasta }}</p>
            </div>
          }
        </div>
      }

      <!-- Tabla histórico -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Período</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Tipo</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">E.A. %</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">E.M. %</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Vigencia</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Estado</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Aprobado por</th>
                <th class="px-4 py-3 w-24 text-center font-medium text-neutral-600 *hasRole">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @if (store.loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6,7,8]; track j) {
                    <td class="px-4 py-3"><div class="h-4 bg-neutral-200 rounded animate-pulse"></div></td>
                  }</tr>
                }
              } @else if (store.tasas().length === 0) {
                <tr><td colspan="8" class="py-0">
                  <app-empty-state icon="percent" title="Sin tasas registradas"
                                   description="Registra las tasas del período actual para habilitar las operaciones."/>
                </td></tr>
              } @else {
                @for (t of store.tasas(); track t.id) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-neutral-700">
                      {{ mes(t.mes) }} {{ t.anio }}
                    </td>
                    <td class="px-4 py-3 text-neutral-600 text-xs">{{ tipoLabel(t.tipoTasa) }}</td>
                    <td class="px-4 py-3 text-right font-mono text-neutral-800">{{ t.valorPorcentajeEfectivoAnual }}</td>
                    <td class="px-4 py-3 text-right font-mono text-neutral-500">{{ t.valorPorcentajeMensual }}</td>
                    <td class="px-4 py-3 text-xs text-neutral-500">
                      {{ t.vigenciaDesde }} → {{ t.vigenciaHasta }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <app-badge [label]="t.estado" [severity]="estadoSeverity(t.estado)"/>
                    </td>
                    <td class="px-4 py-3 text-xs text-neutral-500">
                      {{ t.aprobadoPorNombre ?? '—' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (t.estado === 'PENDIENTE') {
                        <div class="flex gap-1 justify-center" *hasRole="['APROBADOR','ADMIN']">
                          <button (click)="iniciarAprobacion(t)"
                                  class="text-success hover:text-success/80 transition-colors"
                                  title="Aprobar">
                            <span class="material-symbols-outlined text-base">check_circle</span>
                          </button>
                          <button (click)="iniciarRechazo(t)"
                                  class="text-danger hover:text-danger/80 transition-colors"
                                  title="Rechazar">
                            <span class="material-symbols-outlined text-base">cancel</span>
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

    <!-- Confirm aprobar -->
    <app-confirm-dialog
      [open]="confirmAprobar()"
      title="Aprobar tasa"
      message="¿Confirmas la aprobación de esta tasa? Quedará vigente para las operaciones del sistema."
      confirmLabel="Aprobar"
      [loading]="procesando()"
      (confirmed)="confirmarAprobacion()"
      (cancelled)="confirmAprobar.set(false)"/>

    <!-- Confirm rechazar -->
    <app-confirm-dialog
      [open]="confirmRechazar()"
      title="Rechazar tasa"
      message="¿Confirmas el rechazo de esta tasa? Tesorería deberá enviar una nueva solicitud."
      confirmLabel="Rechazar"
      [loading]="procesando()"
      (confirmed)="confirmarRechazo()"
      (cancelled)="confirmRechazar.set(false)"/>
  `,
})
export class TasasListPage implements OnInit {
  protected readonly store = inject(TasasStore);
  private readonly svc    = inject(TasasService);
  private readonly router = inject(Router);

  protected confirmAprobar = signal(false);
  protected confirmRechazar = signal(false);
  protected procesando     = signal(false);
  protected vigentesHoy    = signal<TasaPeriodo[]>([]);
  private tasaSeleccionada: TasaPeriodo | null = null;

  ngOnInit(): void {
    this.store.cargar();
    this.svc.vigentes().subscribe(v => this.vigentesHoy.set(v));
  }

  protected irAForm(): void { this.router.navigate(['/configuracion/tasas-periodo/nueva']); }
  protected tipoLabel(tipo: string): string { return TIPO_TASA_LABEL[tipo as keyof typeof TIPO_TASA_LABEL] ?? tipo; }
  protected mes(n: number): string { return MESES[n] ?? String(n); }

  protected estadoSeverity(estado: string): BadgeSeverity {
    const m: Record<string, BadgeSeverity> = {
      PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'danger',
    };
    return m[estado] ?? 'pending';
  }

  protected iniciarAprobacion(t: TasaPeriodo): void {
    this.tasaSeleccionada = t;
    this.confirmAprobar.set(true);
  }

  protected iniciarRechazo(t: TasaPeriodo): void {
    this.tasaSeleccionada = t;
    this.confirmRechazar.set(true);
  }

  protected confirmarAprobacion(): void {
    if (!this.tasaSeleccionada) return;
    this.procesando.set(true);
    this.svc.aprobar(this.tasaSeleccionada.id).subscribe({
      next: () => { this.procesando.set(false); this.confirmAprobar.set(false); this.store.cargar(); },
      error: () => this.procesando.set(false),
    });
  }

  protected confirmarRechazo(): void {
    if (!this.tasaSeleccionada) return;
    this.procesando.set(true);
    this.svc.rechazar(this.tasaSeleccionada.id, 'Rechazado por el aprobador').subscribe({
      next: () => { this.procesando.set(false); this.confirmRechazar.set(false); this.store.cargar(); },
      error: () => this.procesando.set(false),
    });
  }
}
