import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '@env/environment';
import { ButtonComponent } from '@shared/ui/button/button.component';

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
                           [value]="currentYear" min="2020" max="2099"
                           class="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-brand-primary/30"/>
                  }
                </div>
              }
            </div>

            <app-button (clicked)="descargar(rep)">
              <span class="material-symbols-outlined text-sm mr-1">download</span>
              Generar Excel
            </app-button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReportesPage {
  paramValues: Record<string, string> = {};
  currentYear = new Date().getFullYear().toString();
  downloading = signal(false);

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
    const p = this.paramValues;
    let url = '';

    switch (rep.id) {
      case 'saldos':
        url = `${this.apiBase}/saldos?fecha=${p['saldos_fecha'] || new Date().toISOString().split('T')[0]}`;
        break;
      case 'liquidacion':
        url = `${this.apiBase}/liquidacion-anual/${p['liquidacion_anio'] || this.currentYear}`;
        break;
      case 'auditoria': {
        const hoy = new Date().toISOString().split('T')[0];
        const hace90 = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
        url = `${this.apiBase}/auditoria-pipeline?desde=${p['auditoria_desde'] || hace90}&hasta=${p['auditoria_hasta'] || hoy}`;
        break;
      }
      case 'gmf':
        url = `${this.apiBase}/gmf/${p['gmf_anio'] || this.currentYear}`;
        break;
      case 'presunto':
        url = `${this.apiBase}/presunto/${p['presunto_anio'] || this.currentYear}`;
        break;
    }

    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      a.click();
    }
  }
}
