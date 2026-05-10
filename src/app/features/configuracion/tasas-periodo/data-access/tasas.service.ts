import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { BloqueoSistema, RegistrarTasaRequest, TasaPeriodo } from '../domain/tasa-periodo.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class TasasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/tasas-periodo`;

  listar(): Observable<TasaPeriodo[]> {
    return this.http.get<ApiResponse<TasaPeriodo[]>>(this.base).pipe(map(r => r.data));
  }

  listarPendientes(): Observable<TasaPeriodo[]> {
    return this.http.get<ApiResponse<TasaPeriodo[]>>(`${this.base}/pendientes`).pipe(map(r => r.data));
  }

  vigentes(): Observable<TasaPeriodo[]> {
    return this.http.get<ApiResponse<TasaPeriodo[]>>(`${this.base}/vigentes`).pipe(map(r => r.data));
  }

  registrar(request: RegistrarTasaRequest): Observable<TasaPeriodo> {
    return this.http.post<ApiResponse<TasaPeriodo>>(this.base, request).pipe(map(r => r.data));
  }

  aprobar(id: number, observacion?: string): Observable<TasaPeriodo> {
    return this.http.patch<ApiResponse<TasaPeriodo>>(`${this.base}/${id}/aprobar`, { observacion }).pipe(map(r => r.data));
  }

  rechazar(id: number, motivo: string): Observable<TasaPeriodo> {
    return this.http.patch<ApiResponse<TasaPeriodo>>(`${this.base}/${id}/rechazar`, { motivo }).pipe(map(r => r.data));
  }

  estadoBloqueo(): Observable<BloqueoSistema> {
    return this.http.get<ApiResponse<BloqueoSistema>>(`${this.base}/estado-bloqueo`).pipe(map(r => r.data));
  }

  estadoBloqueoEmpresa(empresaId: number): Observable<BloqueoSistema> {
    return this.http.get<ApiResponse<BloqueoSistema>>(`${this.base}/estado-bloqueo/empresas/${empresaId}`).pipe(map(r => r.data));
  }
}
