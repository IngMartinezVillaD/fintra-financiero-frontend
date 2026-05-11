import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { LiquidacionMensual } from '../domain/liquidacion.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class LiquidacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/liquidaciones-mensuales`;

  listar(): Observable<LiquidacionMensual[]> {
    return this.http.get<ApiResponse<LiquidacionMensual[]>>(this.base).pipe(map(r => r.data));
  }

  obtener(id: number): Observable<LiquidacionMensual> {
    return this.http.get<ApiResponse<LiquidacionMensual>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  iniciar(anio: number, mes: number): Observable<LiquidacionMensual> {
    return this.http.post<ApiResponse<LiquidacionMensual>>(this.base, { anio, mes }).pipe(map(r => r.data));
  }

  calcular(id: number): Observable<LiquidacionMensual> {
    return this.http.post<ApiResponse<LiquidacionMensual>>(`${this.base}/${id}/calcular`, {}).pipe(map(r => r.data));
  }

  aprobar(id: number): Observable<LiquidacionMensual> {
    return this.http.patch<ApiResponse<LiquidacionMensual>>(`${this.base}/${id}/aprobar`, {}).pipe(map(r => r.data));
  }

  revertir(id: number): Observable<LiquidacionMensual> {
    return this.http.patch<ApiResponse<LiquidacionMensual>>(`${this.base}/${id}/revertir`, {}).pipe(map(r => r.data));
  }

  marcarContabilizada(id: number): Observable<LiquidacionMensual> {
    return this.http.patch<ApiResponse<LiquidacionMensual>>(`${this.base}/${id}/contabilizada`, {}).pipe(map(r => r.data));
  }

  urlPlantilla(id: number, empresaId: number): string {
    return `${this.base}/${id}/plantillas/${empresaId}/descargar`;
  }
}
