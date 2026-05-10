import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AvisoTramoAnterior, CrearOperacionRequest, Operacion,
  OperacionListItem, PagedResponse
} from '../domain/operacion.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/operaciones`;

  listar(filtros: {
    estado?: string; prestamistaId?: number;
    prestatariaId?: number; referencia?: string;
    page?: number; size?: number;
  }): Observable<PagedResponse<OperacionListItem>> {
    let params = new HttpParams()
      .set('page', String(filtros.page ?? 0))
      .set('size', String(filtros.size ?? 10));
    if (filtros.estado)        params = params.set('estado',        filtros.estado);
    if (filtros.prestamistaId) params = params.set('prestamistaId', String(filtros.prestamistaId));
    if (filtros.prestatariaId) params = params.set('prestatariaId', String(filtros.prestatariaId));
    if (filtros.referencia)    params = params.set('referencia',    filtros.referencia);
    return this.http.get<ApiResponse<PagedResponse<OperacionListItem>>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  obtener(id: number): Observable<Operacion> {
    return this.http.get<ApiResponse<Operacion>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  crear(request: CrearOperacionRequest): Observable<Operacion> {
    return this.http.post<ApiResponse<Operacion>>(this.base, request).pipe(map(r => r.data));
  }

  editar(id: number, request: CrearOperacionRequest): Observable<Operacion> {
    return this.http.put<ApiResponse<Operacion>>(`${this.base}/${id}`, request).pipe(map(r => r.data));
  }

  cancelar(id: number, motivo?: string): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/cancelar`, { motivo }).pipe(map(r => r.data));
  }

  enviarAprobacion(id: number): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/enviar-aprobacion`, {}).pipe(map(r => r.data));
  }

  avisoTramoAnterior(empresaPrestatariaId: number): Observable<AvisoTramoAnterior | null> {
    return this.http.get<ApiResponse<AvisoTramoAnterior | null>>(
      `${this.base}/aviso-tramo-anterior/${empresaPrestatariaId}`).pipe(map(r => r.data));
  }

  // ── AI ──────────────────────────────────────────────
  pendientesAprobacion(): Observable<OperacionListItem[]> {
    return this.http.get<ApiResponse<OperacionListItem[]>>(`${this.base}/pendientes-aprobacion`).pipe(map(r => r.data));
  }
  aprobarInterna(id: number, observacion?: string): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/aprobar-interna`, { observacion }).pipe(map(r => r.data));
  }
  devolverDesdeAI(id: number, observacion: string): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/devolver`, { observacion }).pipe(map(r => r.data));
  }
  rechazarInterna(id: number, motivo: string): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/rechazar-interna`, { motivo }).pipe(map(r => r.data));
  }

  // ── AE ──────────────────────────────────────────────
  pendientesAceptacion(): Observable<OperacionListItem[]> {
    return this.http.get<ApiResponse<OperacionListItem[]>>(`${this.base}/pendientes-aceptacion`).pipe(map(r => r.data));
  }
  aceptarEmpresa(id: number, observacion?: string): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/aceptar-empresa`, { observacion }).pipe(map(r => r.data));
  }
  rechazarEmpresa(id: number, motivo: string): Observable<Operacion> {
    return this.http.patch<ApiResponse<Operacion>>(`${this.base}/${id}/rechazar-empresa`, { motivo }).pipe(map(r => r.data));
  }

  historial(id: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/${id}/historial`).pipe(map(r => r.data));
  }
}
