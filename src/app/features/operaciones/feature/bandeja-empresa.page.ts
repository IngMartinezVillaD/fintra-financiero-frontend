import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperacionesService } from '../data-access/operaciones.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { DrawerComponent } from '@shared/ui/drawer/drawer.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { OperacionListItem } from '../domain/operacion.model';

@Component({
  selector: 'app-bandeja-empresa',
  standalone: true,
  imports: [
    FormsModule, ButtonComponent, DrawerComponent,
    ConfirmDialogComponent, EmptyStateComponent, CurrencyCopPipe,
  ],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Bandeja de Aceptación</h1>
        <p class="text-sm text-neutral-500 mt-0.5">Operaciones pendientes de aceptación por su empresa (AE)</p>
      </div>

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Referencia</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Prestamista</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Monto Est.</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Días esperando</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Creada</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-24">Acciones</th>
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
                  <app-empty-state icon="handshake" title="Sin operaciones pendientes"
                                   description="No hay operaciones esperando aceptación de su empresa."/>
                </td></tr>
              } @else {
                @for (op of items(); track op.id) {
                  <tr class="hover:bg-neutral-50 cursor-pointer transition-colors" (click)="abrirDetalle(op)">
                    <td class="px-4 py-3 font-mono text-xs font-semibold text-brand-primary">
                      {{ op.referencia ?? '—' }}
                    </td>
                    <td class="px-4 py-3 font-medium text-neutral-700">
                      {{ op.empresaPrestamistaNombre }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono">
                      {{ op.montoEstimado ? (op.montoEstimado | currencyCop) : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span [class]="diasClass(op.diasEsperando)" class="font-semibold text-sm">
                        {{ op.diasEsperando }}d
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs text-neutral-500">{{ op.fechaCreacion }}</td>
                    <td class="px-4 py-3 text-center">
                      <button class="text-brand-primary hover:text-brand-secondary transition-colors"
                              (click)="abrirDetalle(op); $event.stopPropagation()">
                        <span class="material-symbols-outlined text-base">open_in_new</span>
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

    <!-- Drawer detalle + decisión -->
    <app-drawer [open]="drawerOpen()" [title]="'Revisión — ' + (selected()?.referencia ?? '')"
                (closed)="cerrarDrawer()">
      @if (selected()) {
        <div class="space-y-4">
          <div class="bg-info/10 border border-info/30 rounded-lg p-3 text-sm text-info">
            <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
            Al aceptar, la operación avanza a <strong>Firma Digital (FD)</strong>.
          </div>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-neutral-500">Prestamista</dt>
              <dd class="font-medium">{{ selected()!.empresaPrestamistaNombre }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">Cobra interés</dt>
              <dd class="font-medium">{{ interesLabel(selected()!.cobraInteres) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">Monto estimado</dt>
              <dd class="font-mono font-medium">
                {{ selected()!.montoEstimado ? (selected()!.montoEstimado | currencyCop) : '—' }}
              </dd>
            </div>
          </dl>

          <hr class="border-neutral-100">

          <div>
            <label class="block text-xs font-medium text-neutral-600 mb-1">
              Observación (opcional para aceptar, obligatoria para rechazar)
            </label>
            <textarea [(ngModel)]="observacion" rows="3" class="form-input text-sm"
                      placeholder="Aceptado conforme a las condiciones pactadas..."></textarea>
          </div>

          @if (errorMsg()) {
            <p class="text-xs text-danger">{{ errorMsg() }}</p>
          }
        </div>
      }

      <div slot="footer" class="flex gap-3">
        <app-button variant="danger" class="flex-1" (clicked)="iniciarRechazo()" [loading]="procesando()">
          Rechazar
        </app-button>
        <app-button class="flex-1" (clicked)="iniciarAceptacion()" [loading]="procesando()">
          Aceptar → FD
        </app-button>
      </div>
    </app-drawer>

    <!-- Confirm aceptar -->
    <app-confirm-dialog
      [open]="confirmAceptar()"
      title="Confirmar aceptación"
      message="¿Acepta las condiciones de esta operación? Avanzará a Firma Digital (FD)."
      confirmLabel="Aceptar operación"
      [loading]="procesando()"
      (confirmed)="ejecutarAceptacion()"
      (cancelled)="confirmAceptar.set(false)"/>

    <!-- Confirm rechazar -->
    <app-confirm-dialog
      [open]="confirmRechazar()"
      title="Rechazar operación"
      message="¿Confirmas el rechazo? La operación quedará en estado RECHAZADA."
      confirmLabel="Rechazar"
      [loading]="procesando()"
      (confirmed)="ejecutarRechazo()"
      (cancelled)="confirmRechazar.set(false)"/>
  `,
})
export class BandejaEmpresaPage implements OnInit {
  private readonly svc = inject(OperacionesService);

  protected items        = signal<OperacionListItem[]>([]);
  protected loading      = signal(true);
  protected selected     = signal<OperacionListItem | null>(null);
  protected drawerOpen   = signal(false);
  protected procesando   = signal(false);
  protected confirmAceptar  = signal(false);
  protected confirmRechazar = signal(false);
  protected observacion  = '';
  protected errorMsg     = signal('');

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.loading.set(true);
    this.svc.pendientesAceptacion().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  protected abrirDetalle(op: OperacionListItem): void {
    this.selected.set(op);
    this.observacion = '';
    this.errorMsg.set('');
    this.drawerOpen.set(true);
  }

  protected cerrarDrawer(): void { this.drawerOpen.set(false); this.selected.set(null); }

  protected iniciarAceptacion(): void { this.confirmAceptar.set(true); }

  protected iniciarRechazo(): void {
    if (!this.observacion.trim()) { this.errorMsg.set('El motivo de rechazo es obligatorio'); return; }
    this.confirmRechazar.set(true);
  }

  protected ejecutarAceptacion(): void {
    const id = this.selected()?.id;
    if (!id) return;
    this.procesando.set(true);
    this.svc.aceptarEmpresa(id, this.observacion).subscribe({
      next: () => { this.procesando.set(false); this.confirmAceptar.set(false); this.drawerOpen.set(false); this.cargar(); },
      error: () => this.procesando.set(false),
    });
  }

  protected ejecutarRechazo(): void {
    const id = this.selected()?.id;
    if (!id) return;
    this.procesando.set(true);
    this.svc.rechazarEmpresa(id, this.observacion).subscribe({
      next: () => { this.procesando.set(false); this.confirmRechazar.set(false); this.drawerOpen.set(false); this.cargar(); },
      error: () => this.procesando.set(false),
    });
  }

  protected interesLabel(v: string): string {
    return v === 'SI_COMERCIAL' ? 'Sí — Comercial' : v === 'SI_ESPECIAL' ? 'Sí — Especial' : 'No cobra interés';
  }

  protected diasClass(dias: number | undefined): string {
    if (!dias) return 'text-neutral-500';
    if (dias >= 5) return 'text-danger';
    if (dias >= 3) return 'text-warning';
    return 'text-success';
  }
}
