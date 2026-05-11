import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DashboardData, EvolucionMensual, KpiGerencial } from '../domain/dashboard.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/dashboard`;

  dashboard(): Observable<DashboardData> {
    return this.http.get<ApiResponse<DashboardData>>(this.base).pipe(map(r => r.data));
  }

  evolucion(desde: string, hasta: string, empresaId?: number): Observable<EvolucionMensual[]> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (empresaId) params = params.set('empresaId', empresaId);
    return this.http.get<ApiResponse<EvolucionMensual[]>>(`${this.base}/evolucion`, { params })
      .pipe(map(r => r.data));
  }

  kpis(): Observable<KpiGerencial> {
    return this.http.get<ApiResponse<KpiGerencial>>(`${this.base}/kpis-gerenciales`).pipe(map(r => r.data));
  }
}
