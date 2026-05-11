import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '@env/environment';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { HttpClient } from '@angular/common/http';

interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  icon: string;
  params: { label: string; key: string; type: 'date' | 'year' | 'daterange' }[];
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Reportes</h1>
        <p class="text-sm text-neutral-500 mt-0.5">Exportación Excel de información financiera</p>
      </div>

      @if (error()) {
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (rep of reportes; track rep.id) {
          <div class="card p-5 space-y-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-brand-primary text-2xl">{{ rep.icon }}</span>
              <div>
                <p class="text-sm font-semibold text-neutral-900">{{ rep.titulo }}</p>
                <p class="text-xs text-neutral-500 mt-0.5">{{ rep.descripcion }}</p>
              </div>
            </div>

            <div class="space-y-2">
              @for (param of rep.params; track param.key) {
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">{{ param.label }}</label>
                  @if (param.type === 'date') {
                    <input type="date" [(ngModel)]="paramValues[rep.id + '_' + param.key]"
                           class="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-brand-primary/30"/>
                  }
                  @if (param.type === 'year') {
                    <input type="number" [(ngModel)]="paramValues[rep.id + '_' + param.key]"
                           [placeholder]="currentYear" min="2020" max="2099"
                           class="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-brand-primary/30"/>
                  }
                </div>
              }
            </div>

            <app-button (clicked)="descargar(rep)" [disabled]="descargando() === rep.id">
              @if (descargando() === rep.id) {
                <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></span>
                Generando...
              } @else {
                <span class="material-symbols-outlined text-sm mr-1">download</span>
                Generar Excel
              }
            </app-button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReportesPage {
  private readonly http = inject(HttpClient);

  paramValues: Record<string, string> = {};
  currentYear = new Date().getFullYear().toString();
  descargando = signal<string | null>(null);
  error = signal<string | null>(null);

  private readonly apiBase = `${environment.apiBaseUrl}/reportes`;

  reportes: Reporte[] = [
    {
      id: 'saldos',
      titulo: 'Saldos por empresa',
      descripcion: 'Capital e intereses causados por empresa a una fecha',
      icon: 'account_balance',
      params: [{ label: 'Fecha de corte', key: 'fecha', type: 'date' }],
    },
    {
      id: 'liquidacion',
      titulo: 'Liquidación anual',
      descripcion: 'Resumen mensual de intereses liquidados, retenciones y neto del año',
      icon: 'receipt_long',
      params: [{ label: 'Año', key: 'anio', type: 'year' }],
    },
    {
      id: 'auditoria',
      titulo: 'Auditoría de tramos',
      descripcion: 'Bitácora de apertura y cierre de tramos por período',
      icon: 'history',
      params: [
        { label: 'Desde', key: 'desde', type: 'date' },
        { label: 'Hasta', key: 'hasta', type: 'date' },
      ],
    },
    {
      id: 'gmf',
      titulo: 'GMF anual por empresa',
      descripcion: 'Movimientos GMF (4×1000) y decisiones anuales',
      icon: 'payments',
      params: [{ label: 'Año', key: 'anio', type: 'year' }],
    },
    {
      id: 'presunto',
      titulo: 'Interés presunto DIAN',
      descripcion: 'Reporte anual para depuración fiscal — exportación DIAN',
      icon: 'gavel',
      params: [{ label: 'Año', key: 'anio', type: 'year' }],
    },
  ];

  descargar(rep: Reporte) {
    if (this.descargando()) return;
    this.error.set(null);

    const p = this.paramValues;
    const hoy = new Date().toISOString().split('T')[0];
    let url = '';
    let filename = '';

    switch (rep.id) {
      case 'saldos': {
        const fecha = p['saldos_fecha'] || hoy;
        url = `${this.apiBase}/saldos?fecha=${fecha}`;
        filename = `saldos-${fecha}.xlsx`;
        break;
      }
      case 'liquidacion': {
        const anio = p['liquidacion_anio'] || this.currentYear;
        url = `${this.apiBase}/liquidacion-anual/${anio}`;
        filename = `liquidacion-${anio}.xlsx`;
        break;
      }
      case 'auditoria': {
        const hace90 = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
        const desde = p['auditoria_desde'] || hace90;
        const hasta = p['auditoria_hasta'] || hoy;
        url = `${this.apiBase}/auditoria-pipeline?desde=${desde}&hasta=${hasta}`;
        filename = `auditoria-${desde}-${hasta}.xlsx`;
        break;
      }
      case 'gmf': {
        const anio = p['gmf_anio'] || this.currentYear;
        url = `${this.apiBase}/gmf/${anio}`;
        filename = `gmf-${anio}.xlsx`;
        break;
      }
      case 'presunto': {
        const anio = p['presunto_anio'] || this.currentYear;
        url = `${this.apiBase}/presunto/${anio}`;
        filename = `presunto-dian-${anio}.xlsx`;
        break;
      }
    }

    if (!url) return;

    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      this.error.set('Sesión expirada. Por favor inicia sesión nuevamente.');
      return;
    }

    this.descargando.set(rep.id);

    this.http.get(url, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.descargando.set(null);
      },
      error: (err) => {
        this.descargando.set(null);
        if (err.status === 403 || err.status === 401) {
          this.error.set('No tienes permisos para descargar este reporte.');
        } else {
          this.error.set('Error al generar el reporte. Inténtalo de nuevo.');
        }
      },
    });
  }
}
