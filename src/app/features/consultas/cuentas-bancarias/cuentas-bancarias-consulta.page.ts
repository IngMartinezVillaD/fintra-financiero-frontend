import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '@env/environment';
import { map } from 'rxjs';

interface CuentaConsulta {
  id: number;
  empresaId: number;
  empresaCodigo: string;
  empresaNombre: string;
  bancoCodigo: string;
  bancoNombre: string;
  tipo: 'CORRIENTE' | 'AHORROS';
  numeroCuenta: string;
  titular: string;
  codigoContable: string | null;
  exentaGmf: boolean;
  activa: boolean;
}

interface Banco { codigo: string; nombre: string; }
interface ApiResponse<T> { code: number; message: string; data: T; }

@Component({
  selector: 'app-cuentas-bancarias-consulta',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-4">

      <!-- Page header -->
      <div>
        <h1 class="text-[17px] font-bold text-neutral-900">Cuentas bancarias</h1>
        <p class="text-[12px] text-neutral-400 mt-0.5">Consulta de todas las cuentas bancarias registradas por empresa</p>
      </div>

      <!-- Filtros -->
      <div class="section-block">
        <div class="section-header">
          <span class="material-symbols-outlined text-neutral-400 text-[16px]">filter_list</span>
          <span class="section-title">Filtros</span>
        </div>
        <div class="grid grid-cols-4 gap-3 p-3.5">
          <div class="flex flex-col gap-1">
            <label class="field-label">Banco</label>
            <select [(ngModel)]="filtroBanco" (ngModelChange)="aplicarFiltros()" class="field-input">
              <option value="">Todos los bancos</option>
              @for (b of bancos(); track b.codigo) {
                <option [value]="b.codigo">{{ b.nombre }}</option>
              }
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="field-label">Tipo</label>
            <select [(ngModel)]="filtroTipo" (ngModelChange)="aplicarFiltros()" class="field-input">
              <option value="">Todos</option>
              <option value="CORRIENTE">Cuenta Corriente</option>
              <option value="AHORROS">Cuenta de Ahorros</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="field-label">Estado</label>
            <select [(ngModel)]="filtroActiva" (ngModelChange)="aplicarFiltros()" class="field-input">
              <option value="">Todos</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="field-label">Buscar empresa</label>
            <input [(ngModel)]="filtroBusqueda" (ngModelChange)="filtrarLocal()"
                   class="field-input" placeholder="Nombre o código…">
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">

        <!-- Cabecera tabla -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <span class="text-xs font-bold text-neutral-700">
            {{ cuentasFiltradas().length }} cuenta{{ cuentasFiltradas().length !== 1 ? 's' : '' }}
          </span>
          @if (loading()) {
            <span class="text-[11px] text-neutral-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              Cargando…
            </span>
          }
        </div>

        @if (!loading() && cuentasFiltradas().length === 0) {
          <div class="py-12 text-center">
            <span class="material-symbols-outlined text-neutral-300 text-4xl">account_balance</span>
            <p class="text-sm text-neutral-400 mt-2">No se encontraron cuentas bancarias</p>
          </div>
        }

        @if (cuentasFiltradas().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr class="bg-neutral-50 border-b border-neutral-200">
                  <th class="text-left px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Empresa</th>
                  <th class="text-left px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Banco</th>
                  <th class="text-left px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Tipo</th>
                  <th class="text-left px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">N° Cuenta</th>
                  <th class="text-left px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Titular</th>
                  <th class="text-left px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Cód. Contable</th>
                  <th class="text-center px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">GMF</th>
                  <th class="text-center px-4 py-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (c of cuentasFiltradas(); track c.id) {
                  <tr class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-2.5">
                      <div class="font-semibold text-neutral-800">{{ c.empresaCodigo }}</div>
                      <div class="text-[10px] text-neutral-400 mt-0.5">{{ c.empresaNombre }}</div>
                    </td>
                    <td class="px-4 py-2.5 text-neutral-700">{{ c.bancoNombre }}</td>
                    <td class="px-4 py-2.5">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            [class]="c.tipo === 'CORRIENTE'
                              ? 'bg-brand-light text-brand-primary'
                              : 'bg-neutral-100 text-neutral-600'">
                        {{ c.tipo === 'CORRIENTE' ? 'Corriente' : 'Ahorros' }}
                      </span>
                    </td>
                    <td class="px-4 py-2.5 font-mono text-neutral-700">{{ c.numeroCuenta }}</td>
                    <td class="px-4 py-2.5 text-neutral-700">{{ c.titular }}</td>
                    <td class="px-4 py-2.5 font-mono text-neutral-500">{{ c.codigoContable || '—' }}</td>
                    <td class="px-4 py-2.5 text-center">
                      @if (c.exentaGmf) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-light text-success">Exenta</span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600">4×1000</span>
                      }
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      @if (c.activa) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-light text-success">Activa</span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-500">Inactiva</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

    </div>
  `,
})
export class CuentasBancariasConsultaPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/empresas`;

  protected loading        = signal(true);
  protected bancos         = signal<Banco[]>([]);
  private   todasCuentas   = signal<CuentaConsulta[]>([]);
  protected cuentasFiltradas = computed(() => {
    const q = this.filtroBusqueda.toLowerCase();
    if (!q) return this.todasCuentas();
    return this.todasCuentas().filter(c =>
      c.empresaNombre.toLowerCase().includes(q) ||
      c.empresaCodigo.toLowerCase().includes(q)
    );
  });

  filtroBanco    = '';
  filtroTipo     = '';
  filtroActiva   = '';
  filtroBusqueda = '';

  ngOnInit(): void {
    this.http.get<ApiResponse<Banco[]>>(`${this.base}/bancos`)
      .pipe(map(r => r.data))
      .subscribe(b => this.bancos.set(b));

    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    let params = new HttpParams();
    if (this.filtroBanco)  params = params.set('bancoCodigo', this.filtroBanco);
    if (this.filtroTipo)   params = params.set('tipo', this.filtroTipo);
    if (this.filtroActiva) params = params.set('activa', this.filtroActiva);

    this.http.get<ApiResponse<CuentaConsulta[]>>(`${this.base}/cuentas-bancarias`, { params })
      .pipe(map(r => r.data))
      .subscribe({
        next:  data => { this.todasCuentas.set(data); this.loading.set(false); },
        error: ()   => { this.loading.set(false); },
      });
  }

  protected aplicarFiltros(): void { this.cargar(); }
  protected filtrarLocal():    void { /* cuentasFiltradas computed se actualiza sola */ }
}
