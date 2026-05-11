import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { GmfEmpresa, PresuntoEmpresa } from '../domain/controles.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class ControlesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/controles`;

  // GMF
  consolidadoGmf(anio: number): Observable<GmfEmpresa[]> {
    return this.http.get<ApiResponse<GmfEmpresa[]>>(`${this.base}/gmf?anio=${anio}`).pipe(map(r => r.data));
  }

  gmfPorEmpresa(empresaId: number, anio: number): Observable<GmfEmpresa> {
    return this.http.get<ApiResponse<GmfEmpresa>>(`${this.base}/gmf/empresas/${empresaId}/${anio}`).pipe(map(r => r.data));
  }

  registrarDecisionGmf(empresaId: number, anio: number, decision: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.base}/gmf/decisiones-anuales`,
      { empresaId, anio, decision }).pipe(map(r => r.data));
  }

  // Presunto
  consolidadoPresunto(anio: number): Observable<PresuntoEmpresa[]> {
    return this.http.get<ApiResponse<PresuntoEmpresa[]>>(`${this.base}/presunto?anio=${anio}`).pipe(map(r => r.data));
  }

  presuntoPorEmpresa(empresaId: number, anio: number): Observable<PresuntoEmpresa> {
    return this.http.get<ApiResponse<PresuntoEmpresa>>(`${this.base}/presunto/empresas/${empresaId}/${anio}`).pipe(map(r => r.data));
  }

  ejecutarPresunto(anio: number, mes: number): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.base}/presunto/${anio}/${mes}/ejecutar`, {}).pipe(map(r => r.data));
  }
}
