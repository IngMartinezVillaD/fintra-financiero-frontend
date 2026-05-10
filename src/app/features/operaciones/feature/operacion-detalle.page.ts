import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperacionesStore } from '../data-access/operaciones.store';
import { OperacionesService } from '../data-access/operaciones.service';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { BadgeComponent, BadgeSeverity } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { PipelineStepperComponent, PipelineStep } from '@shared/ui/stepper/stepper.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { EstadoPipeline } from '../domain/operacion.model';

@Component({
  selector: 'app-operacion-detalle',
  standalone: true,
  imports: [
    HasRoleDirective, BadgeComponent, ButtonComponent,
    PipelineStepperComponent, ConfirmDialogComponent, CurrencyCopPipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <button (click)="router.navigate(['/operaciones'])"
                class="text-neutral-400 hover:text-neutral-700 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold text-neutral-900 font-mono">
              {{ store.selected()?.referencia ?? '...' }}
            </h1>
            @if (store.selected()) {
              <app-badge [label]="store.selected()!.estadoPipeline"
                         [severity]="estadoSeverity(store.selected()!.estadoPipeline)"/>
            }
          </div>
          <p class="text-sm text-neutral-500 mt-0.5">
            Creada el {{ store.selected()?.fechaCreacion }} por {{ store.selected()?.creadoPor }}
          </p>
        </div>

        <!-- Acciones según estado -->
        @if (store.selected()?.estadoPipeline === 'CR') {
          <div class="flex gap-2" *hasRole="['ADMIN','TESORERIA']">
            <app-button variant="secondary" (clicked)="router.navigate(['/operaciones', store.selected()!.id, 'editar'])">
              Editar
            </app-button>
            <app-button variant="secondary" (clicked)="enviarAprobacion()"
                        [loading]="procesando()">
              Enviar a aprobación
            </app-button>
          </div>
        }
      </div>

      @if (store.loading()) {
        <div class="card animate-pulse space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="h-4 bg-neutral-200 rounded"></div>
          }
        </div>
      } @else if (store.selected(); as op) {

        <!-- Pipeline stepper -->
        <div class="card py-4 flex justify-center">
          <app-pipeline-stepper [current]="asPipelineStep(op.estadoPipeline)"
                                [rejected]="op.estadoPipeline === 'RECHAZADA'"/>
        </div>

        <!-- Datos principales -->
        <div class="grid grid-cols-2 gap-4">
          <div class="card space-y-3">
            <h2 class="text-base font-semibold text-neutral-800 border-b pb-2">Partes</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-500">Prestamista</dt>
                <dd class="font-medium">{{ op.empresaPrestamistaCodigoInterno }} — {{ op.empresaPrestamistaNombre }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-500">Prestataria</dt>
                <dd class="font-medium">{{ op.empresaPrestatariaCodigoInterno }} — {{ op.empresaPrestatariaNombre }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-500">Cobra interés</dt>
                <dd class="font-medium">{{ interesLabel(op.cobraInteres) }}</dd>
              </div>
            </dl>
          </div>

          <div class="card space-y-3">
            <h2 class="text-base font-semibold text-neutral-800 border-b pb-2">Financiero</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-neutral-500">Monto estimado</dt>
                <dd class="font-mono font-medium">{{ op.montoEstimado ? (op.montoEstimado | currencyCop) : '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-500">Cuenta origen</dt>
                <dd class="font-medium">{{ op.cuentaOrigenDescripcion ?? '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-neutral-500">Cuenta destino</dt>
                <dd class="font-medium">{{ op.cuentaDestinoDescripcion ?? '—' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Soporte -->
        <div class="card space-y-3">
          <h2 class="text-base font-semibold text-neutral-800 border-b pb-2">Soporte documental</h2>
          <dl class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="text-neutral-500">N° Documento soporte</dt>
              <dd class="font-medium font-mono">{{ op.numDocumentoSoporte }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Fecha creación</dt>
              <dd class="font-medium">{{ op.fechaCreacion }}</dd>
            </div>
          </dl>
          <div>
            <p class="text-xs text-neutral-500 mb-1">Observaciones</p>
            <p class="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3">{{ op.observaciones }}</p>
          </div>
        </div>

        <!-- Aviso tramo anterior -->
        @if (op.avisoTramoAnterior) {
          <div class="bg-warning-light border border-warning rounded-lg p-4 space-y-1">
            <p class="font-semibold text-warning text-sm">⚠ Tramo anterior activo — {{ op.avisoTramoAnterior.referencia }}</p>
            <p class="text-sm text-neutral-700">
              Saldo capital: <strong>{{ op.avisoTramoAnterior.saldoCapital }}</strong> —
              {{ op.avisoTramoAnterior.diasTranscurridos }} días al
              {{ op.avisoTramoAnterior.tasaMensual }}% E.M.
            </p>
            <p class="text-sm text-neutral-700">
              Interés estimado causado: <strong class="text-warning">{{ op.avisoTramoAnterior.interesEstimado }}</strong>
            </p>
          </div>
        }

        <!-- Historial de eventos -->
        <div class="card space-y-3">
          <h2 class="text-base font-semibold text-neutral-800 border-b pb-2">Historial del pipeline</h2>
          @if (op.eventos.length === 0) {
            <p class="text-sm text-neutral-400">Sin eventos registrados</p>
          } @else {
            <ol class="space-y-3">
              @for (ev of op.eventos; track ev.ocurridoAt) {
                <li class="flex gap-3 text-sm">
                  <span class="material-symbols-outlined text-brand-primary text-base mt-0.5">
                    radio_button_checked
                  </span>
                  <div>
                    <p class="font-medium text-neutral-800">
                      {{ ev.estadoAnterior ? ev.estadoAnterior + ' → ' : '' }}{{ ev.estadoNuevo }}
                    </p>
                    <p class="text-xs text-neutral-500">{{ ev.usuario }} · {{ formatFecha(ev.ocurridoAt) }}</p>
                    @if (ev.observacion) {
                      <p class="text-xs text-neutral-600 mt-0.5">{{ ev.observacion }}</p>
                    }
                  </div>
                </li>
              }
            </ol>
          }
        </div>

        <!-- Acciones cancelar -->
        @if (['CR','AI'].includes(op.estadoPipeline)) {
          <div class="flex justify-end" *hasRole="['ADMIN','TESORERIA']">
            <app-button variant="danger" (clicked)="confirmCancelar.set(true)">
              <span class="material-symbols-outlined text-sm mr-1">cancel</span>
              Cancelar operación
            </app-button>
          </div>
        }
      }
    </div>

    <app-confirm-dialog
      [open]="confirmCancelar()"
      title="Cancelar operación"
      message="¿Confirmas la cancelación? Esta acción no se puede deshacer."
      confirmLabel="Cancelar operación"
      [loading]="procesando()"
      (confirmed)="cancelarOperacion()"
      (cancelled)="confirmCancelar.set(false)"/>
  `,
})
export class OperacionDetallePage implements OnInit {
  protected readonly store  = inject(OperacionesStore);
  private readonly svc      = inject(OperacionesService);
  private readonly route    = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  protected procesando     = signal(false);
  protected confirmCancelar = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.store.cargarDetalle(id);
  }

  protected estadoSeverity(estado: EstadoPipeline): BadgeSeverity {
    const m: Record<string, BadgeSeverity> = {
      CR: 'pending', AI: 'active', AE: 'active', FD: 'warning',
      DS: 'success', RECHAZADA: 'danger', CANCELADA: 'danger',
    };
    return m[estado] ?? 'pending';
  }

  protected asPipelineStep(estado: string) {
    return estado as PipelineStep;
  }

  protected formatFecha(iso: string): string {
    return iso ? iso.slice(0, 16).replace('T', ' ') : '';
  }

  protected interesLabel(v: string): string {
    return v === 'SI_COMERCIAL' ? 'Sí — Comercial' : v === 'SI_ESPECIAL' ? 'Sí — Especial' : 'No cobra interés';
  }

  protected enviarAprobacion(): void {
    const id = this.store.selected()?.id;
    if (!id) return;
    this.procesando.set(true);
    this.svc.enviarAprobacion(id).subscribe({
      next: () => { this.procesando.set(false); this.store.cargarDetalle(id); },
      error: () => this.procesando.set(false),
    });
  }

  protected cancelarOperacion(): void {
    const id = this.store.selected()?.id;
    if (!id) return;
    this.procesando.set(true);
    this.svc.cancelar(id).subscribe({
      next: () => { this.procesando.set(false); this.confirmCancelar.set(false); this.store.cargarDetalle(id); },
      error: () => this.procesando.set(false),
    });
  }
}
