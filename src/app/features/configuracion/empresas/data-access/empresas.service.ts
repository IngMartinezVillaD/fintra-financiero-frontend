import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CrearEmpresaRequest, CuentaBancariaRequest, CuentaBancaria,
  Empresa, EmpresaListItem, PagedResponse, TasaEspecial, TasaEspecialRequest
} from '../domain/empresa.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/empresas`;

  listar(filtros: { estado?: string; rolPermitido?: string; busqueda?: string; page?: number; size?: number }): Observable<PagedResponse<EmpresaListItem>> {
    let params = new HttpParams()
      .set('page', String(filtros.page ?? 0))
      .set('size', String(filtros.size ?? 10));
    if (filtros.estado)       params = params.set('estado', filtros.estado);
    if (filtros.rolPermitido) params = params.set('rolPermitido', filtros.rolPermitido);
    if (filtros.busqueda)     params = params.set('busqueda', filtros.busqueda);
    return this.http.get<ApiResponse<PagedResponse<EmpresaListItem>>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  obtener(id: number): Observable<Empresa> {
    return this.http.get<ApiResponse<Empresa>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  crear(request: CrearEmpresaRequest): Observable<Empresa> {
    return this.http.post<ApiResponse<Empresa>>(this.base, request)
      .pipe(map(r => r.data));
  }

  actualizar(id: number, request: Partial<CrearEmpresaRequest>): Observable<Empresa> {
    return this.http.put<ApiResponse<Empresa>>(`${this.base}/${id}`, request)
      .pipe(map(r => r.data));
  }

  inactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/inactivar`, {});
  }

  agregarCuenta(empresaId: number, request: CuentaBancariaRequest): Observable<CuentaBancaria> {
    return this.http.post<ApiResponse<CuentaBancaria>>(`${this.base}/${empresaId}/cuentas-bancarias`, request)
      .pipe(map(r => r.data));
  }

  editarCuenta(empresaId: number, cuentaId: number, request: CuentaBancariaRequest): Observable<CuentaBancaria> {
    return this.http.put<ApiResponse<CuentaBancaria>>(`${this.base}/${empresaId}/cuentas-bancarias/${cuentaId}`, request)
      .pipe(map(r => r.data));
  }

  desactivarCuenta(empresaId: number, cuentaId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${empresaId}/cuentas-bancarias/${cuentaId}/desactivar`, {});
  }

  listarTasas(empresaId: number): Observable<TasaEspecial[]> {
    return this.http.get<ApiResponse<TasaEspecial[]>>(`${this.base}/${empresaId}/tasas-especiales`)
      .pipe(map(r => r.data));
  }

  solicitarTasa(empresaId: number, request: TasaEspecialRequest): Observable<TasaEspecial> {
    return this.http.post<ApiResponse<TasaEspecial>>(`${this.base}/${empresaId}/tasas-especiales`, request)
      .pipe(map(r => r.data));
  }

  aprobarTasa(empresaId: number, tasaId: number, observacion?: string): Observable<TasaEspecial> {
    return this.http.patch<ApiResponse<TasaEspecial>>(
      `${this.base}/${empresaId}/tasas-especiales/${tasaId}/aprobar`, { observacion })
      .pipe(map(r => r.data));
  }

  rechazarTasa(empresaId: number, tasaId: number, observacion?: string): Observable<TasaEspecial> {
    return this.http.patch<ApiResponse<TasaEspecial>>(
      `${this.base}/${empresaId}/tasas-especiales/${tasaId}/rechazar`, { observacion })
      .pipe(map(r => r.data));
  }
}
