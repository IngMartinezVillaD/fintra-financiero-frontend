import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface PaisDto         { id: number; codigoIso2: string; codigoIso3: string; nombre: string; activo?: boolean; }
export interface DepartamentoDto { id: number; codigoDane: string; nombre: string; paisId?: number; paisNombre?: string; activo?: boolean; }
export interface CiudadDto       { id: number; codigoDane: string; nombre: string; codigoPostal: string; departamentoId?: number; departamentoNombre?: string; activo?: boolean; }

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class GeoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/geo`;

  // ── Selects (solo activos) ────────────────────────────────────
  paises(): Observable<PaisDto[]> {
    return this.http.get<ApiResponse<PaisDto[]>>(`${this.base}/paises`).pipe(map(r => r.data));
  }

  departamentos(paisCodigo = 'CO'): Observable<DepartamentoDto[]> {
    return this.http
      .get<ApiResponse<DepartamentoDto[]>>(`${this.base}/departamentos`, { params: { paisCodigo } })
      .pipe(map(r => r.data));
  }

  ciudades(departamentoCodigo: string): Observable<CiudadDto[]> {
    return this.http
      .get<ApiResponse<CiudadDto[]>>(`${this.base}/ciudades`, { params: { departamentoCodigo } })
      .pipe(map(r => r.data));
  }

  // ── Admin (todos, incluye inactivos) ──────────────────────────
  paisesAdmin(): Observable<PaisDto[]> {
    return this.http.get<ApiResponse<PaisDto[]>>(`${this.base}/paises/admin`).pipe(map(r => r.data));
  }

  departamentosAdmin(paisCodigo: string): Observable<DepartamentoDto[]> {
    return this.http
      .get<ApiResponse<DepartamentoDto[]>>(`${this.base}/departamentos/admin`, { params: { paisCodigo } })
      .pipe(map(r => r.data));
  }

  ciudadesAdmin(departamentoCodigo: string): Observable<CiudadDto[]> {
    return this.http
      .get<ApiResponse<CiudadDto[]>>(`${this.base}/ciudades/admin`, { params: { departamentoCodigo } })
      .pipe(map(r => r.data));
  }

  // ── CRUD países ───────────────────────────────────────────────
  crearPais(body: { codigoIso2: string; codigoIso3: string; nombre: string }): Observable<PaisDto> {
    return this.http.post<ApiResponse<PaisDto>>(`${this.base}/paises`, body).pipe(map(r => r.data));
  }

  actualizarPais(id: number, body: { codigoIso2: string; codigoIso3: string; nombre: string }): Observable<PaisDto> {
    return this.http.put<ApiResponse<PaisDto>>(`${this.base}/paises/${id}`, body).pipe(map(r => r.data));
  }

  estadoPais(id: number, activo: boolean): Observable<PaisDto> {
    return this.http.patch<ApiResponse<PaisDto>>(`${this.base}/paises/${id}/estado`, null, { params: { activo } }).pipe(map(r => r.data));
  }

  // ── CRUD departamentos ────────────────────────────────────────
  crearDepartamento(body: { codigoDane: string; nombre: string; paisId: number }): Observable<DepartamentoDto> {
    return this.http.post<ApiResponse<DepartamentoDto>>(`${this.base}/departamentos`, body).pipe(map(r => r.data));
  }

  actualizarDepartamento(id: number, body: { codigoDane: string; nombre: string; paisId: number }): Observable<DepartamentoDto> {
    return this.http.put<ApiResponse<DepartamentoDto>>(`${this.base}/departamentos/${id}`, body).pipe(map(r => r.data));
  }

  estadoDepartamento(id: number, activo: boolean): Observable<DepartamentoDto> {
    return this.http.patch<ApiResponse<DepartamentoDto>>(`${this.base}/departamentos/${id}/estado`, null, { params: { activo } }).pipe(map(r => r.data));
  }

  // ── CRUD ciudades ─────────────────────────────────────────────
  crearCiudad(body: { codigoDane: string; nombre: string; codigoPostal?: string; departamentoId: number }): Observable<CiudadDto> {
    return this.http.post<ApiResponse<CiudadDto>>(`${this.base}/ciudades`, body).pipe(map(r => r.data));
  }

  actualizarCiudad(id: number, body: { codigoDane: string; nombre: string; codigoPostal?: string; departamentoId: number }): Observable<CiudadDto> {
    return this.http.put<ApiResponse<CiudadDto>>(`${this.base}/ciudades/${id}`, body).pipe(map(r => r.data));
  }

  estadoCiudad(id: number, activo: boolean): Observable<CiudadDto> {
    return this.http.patch<ApiResponse<CiudadDto>>(`${this.base}/ciudades/${id}/estado`, null, { params: { activo } }).pipe(map(r => r.data));
  }
}
