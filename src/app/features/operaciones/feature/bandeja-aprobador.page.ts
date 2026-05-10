import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperacionesService } from '../data-access/operaciones.service';
import { DrawerComponent } from '@shared/ui/drawer/drawer.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { CurrencyCopPipe } from '@shared/pipes/currency-cop.pipe';
import { OperacionListItem } from '../domain/operacion.model';

type Accion = 'aprobar' | 'devolver' | 'rechazar' | null;

@Component({
  selector: 'app-bandeja-aprobador',
  standalone: true,
  imports: [
    FormsModule, DrawerComponent, ConfirmDialogComponent, EmptyStateComponent, CurrencyCopPipe,
  ],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Bandeja de Aprobación</h1>
        <p class="text-sm text-neutral-500 mt-0.5">Operaciones pendientes de revisión interna (AI)</p>
      </div>

      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Referencia</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Prestamista → Prestataria</th>
                <th class="px-4 py-3 text-right font-medium text-neutral-600">Monto Est.</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600">Días esperando</th>
                <th class="px-4 py-3 text-left font-medium text-neutral-600">Creado</th>
                <th class="px-4 py-3 text-center font-medium text-neutral-600 w-28">Acciones</th>
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
                  <app-empty-state icon="task_alt" title="Sin operaciones pendientes"
                                   description="No hay operaciones esperando aprobación interna."/>
                </td></tr>
              } @else {
                @for (op of items(); track op.id) {
                  <tr class="hover:bg-neutral-50 cursor-pointer transition-colors" (click)="abrirDetalle(op)">
                    <td class="px-4 py-3 font-mono text-xs font-semibold text-brand-primary">
                      {{ op.referencia ?? '—' }}
                    </td>
                    <td class="px-4 py-3 text-neutral-700">
                      <span class="font-medium">{{ op.empresaPrestamistaNombre }}</span>
                      <span class="text-neutral-400 mx-1.5">→</span>
                      <span>{{ op.empresaPrestatariaNombre }}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono text-sm">
                      {{ op.montoEstimado ? (op.montoEstimado | currencyCop) : '—' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span [class]="diasClass(op.diasEsperando)"
                            class="font-semibold text-sm">
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

    <!-- Drawer de decisión -->
    <app-drawer [open]="drawerOpen()" [title]="'Decisión — ' + (selected()?.referencia ?? '')"
                (closed)="cerrarDrawer()">
      @if (selected()) {
        <div class="space-y-4">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-neutral-500">Prestamista</dt>
              <dd class="font-medium">{{ selected()!.empresaPrestamistaNombre }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">Prestataria</dt>
              <dd class="font-medium">{{ selected()!.empresaPrestatariaNombre }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">Monto estimado</dt>
              <dd class="font-mono font-medium">
                {{ selected()!.montoEstimado ? (selected()!.montoEstimado | currencyCop) : '—' }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">Días esperando</dt>
              <dd [class]="diasClass(selected()!.diasEsperando)" class="font-bold">
                {{ selected()!.diasEsperando }} días
              </dd>
            </div>
          </dl>

          <hr class="border-neutral-100">

          <p class="text-sm font-semibold text-neutral-700">Selecciona una decisión:</p>

          <!-- Observación/motivo -->
          <div>
            <label class="block text-xs font-medium text-neutral-600 mb-1">
              {{ accion() === 'aprobar' ? 'Observación (opcional)' :
                 accion() === 'devolver' ? 'Observación (obligatoria, mínimo 20 caracteres)' :
                 'Motivo de rechazo (obligatorio)' }}
            </label>
            <textarea [(ngModel)]="observacion" rows="3"
                      class="form-input text-sm"
                      placeholder="{{ accion() === 'aprobar' ? 'Aprobado conforme...' :
                                      accion() === 'devolver' ? 'Solicite corrección de...' :
                                      'Motivo del rechazo...' }}"></textarea>
          </div>

          @if (errorMsg()) {
            <p class="text-xs text-danger">{{ errorMsg() }}</p>
          }
        </div>
      }

      <div slot="footer" class="flex gap-2">
        <button (click)="setAccion('aprobar')"
                class="flex-1 btn-secondary text-success border-success text-sm py-2 rounded-lg"
                [class.bg-success]="accion() === 'aprobar'"
                [class.text-white]="accion() === 'aprobar'">
          ✓ Aprobar
        </button>
        <button (click)="setAccion('devolver')"
                class="flex-1 btn-secondary text-warning border-warning text-sm py-2 rounded-lg"
                [class.bg-warning]="accion() === 'devolver'"
                [class.text-white]="accion() === 'devolver'">
          ↩ Devolver
        </button>
        <button (click)="setAccion('rechazar')"
                class="flex-1 btn-secondary text-danger border-danger text-sm py-2 rounded-lg"
                [class.bg-danger]="accion() === 'rechazar'"
                [class.text-white]="accion() === 'rechazar'">
          ✗ Rechazar
        </button>
      </div>
    </app-drawer>

    <!-- Confirm -->
    <app-confirm-dialog
      [open]="confirmOpen()"
      [title]="confirmTitle()"
      [message]="confirmMsg()"
      [confirmLabel]="confirmLabel()"
      [loading]="procesando()"
      (confirmed)="ejecutarAccion()"
      (cancelled)="confirmOpen.set(false)"/>
  `,
})
export class BandejaAprobadorPage implements OnInit {
  private readonly svc = inject(OperacionesService);

  protected items     = signal<OperacionListItem[]>([]);
  protected loading   = signal(true);
  protected selected  = signal<OperacionListItem | null>(null);
  protected drawerOpen = signal(false);
  protected accion     = signal<Accion>(null);
  protected observacion = '';
  protected procesando = signal(false);
  protected confirmOpen  = signal(false);
  protected confirmTitle = signal('');
  protected confirmMsg   = signal('');
  protected confirmLabel = signal('');
  protected errorMsg   = signal('');

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.loading.set(true);
    this.svc.pendientesAprobacion().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  protected abrirDetalle(op: OperacionListItem): void {
    this.selected.set(op);
    this.accion.set(null);
    this.observacion = '';
    this.errorMsg.set('');
    this.drawerOpen.set(true);
  }

  protected cerrarDrawer(): void {
    this.drawerOpen.set(false);
    this.selected.set(null);
  }

  protected setAccion(a: Accion): void {
    this.accion.set(a);
    this.errorMsg.set('');
    if (a === 'aprobar') {
      this.confirmTitle.set('Aprobar operación');
      this.confirmMsg.set('¿Confirmas la aprobación interna? La operación pasará a Aceptación Empresa (AE).');
      this.confirmLabel.set('Aprobar');
    } else if (a === 'devolver') {
      this.confirmTitle.set('Devolver operación');
      this.confirmMsg.set('¿Confirmas la devolución? La operación vuelve al creador en estado CR.');
      this.confirmLabel.set('Devolver');
    } else {
      this.confirmTitle.set('Rechazar operación');
      this.confirmMsg.set('¿Confirmas el rechazo? La operación quedará en estado RECHAZADA y no podrá reabrirse.');
      this.confirmLabel.set('Rechazar');
    }
    this.confirmOpen.set(true);
  }

  protected ejecutarAccion(): void {
    const id = this.selected()?.id;
    const a  = this.accion();
    if (!id || !a) return;

    if (a === 'devolver' && (!this.observacion || this.observacion.trim().length < 20)) {
      this.confirmOpen.set(false);
      this.errorMsg.set('La observación debe tener al menos 20 caracteres');
      return;
    }
    if (a === 'rechazar' && !this.observacion.trim()) {
      this.confirmOpen.set(false);
      this.errorMsg.set('El motivo de rechazo es obligatorio');
      return;
    }

    this.procesando.set(true);
    const req$ = a === 'aprobar'  ? this.svc.aprobarInterna(id, this.observacion)
               : a === 'devolver' ? this.svc.devolverDesdeAI(id, this.observacion)
               :                    this.svc.rechazarInterna(id, this.observacion);

    req$.subscribe({
      next: () => {
        this.procesando.set(false);
        this.confirmOpen.set(false);
        this.drawerOpen.set(false);
        this.cargar();
      },
      error: () => this.procesando.set(false),
    });
  }

  protected diasClass(dias: number | undefined): string {
    if (!dias) return 'text-neutral-500';
    if (dias >= 5) return 'text-danger';
    if (dias >= 3) return 'text-warning';
    return 'text-success';
  }
}
