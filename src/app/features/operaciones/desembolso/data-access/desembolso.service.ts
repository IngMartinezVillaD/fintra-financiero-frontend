import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ArchivoPlano, ConfirmarDesembolsoRequest, Desembolso,
  GenerarArchivoPlanoRequest, GmfResumen
} from '../domain/desembolso.model';
import { OperacionListItem } from '../../domain/operacion.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class DesembolsoService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  pendientes(): Observable<OperacionListItem[]> {
    return this.http.get<ApiResponse<OperacionListItem[]>>(`${this.base}/desembolsos/pendientes`)
      .pipe(map(r => r.data));
  }

  gmfPreview(operacionId: number, monto: string): Observable<GmfResumen> {
    const params = new HttpParams().set('monto', monto);
    return this.http.get<ApiResponse<GmfResumen>>(
      `${this.base}/operaciones/${operacionId}/desembolsos/gmf-preview`, { params })
      .pipe(map(r => r.data));
  }

  confirmar(operacionId: number, request: ConfirmarDesembolsoRequest): Observable<Desembolso> {
    return this.http.patch<ApiResponse<Desembolso>>(
      `${this.base}/operaciones/${operacionId}/desembolsar`, request)
      .pipe(map(r => r.data));
  }

  listarPorOperacion(operacionId: number): Observable<Desembolso[]> {
    return this.http.get<ApiResponse<Desembolso[]>>(
      `${this.base}/operaciones/${operacionId}/desembolsos`)
      .pipe(map(r => r.data));
  }

  generarArchivoPlano(request: GenerarArchivoPlanoRequest): Observable<ArchivoPlano[]> {
    return this.http.post<ApiResponse<ArchivoPlano[]>>(
      `${this.base}/desembolsos/archivo-plano`, request)
      .pipe(map(r => r.data));
  }

  urlDescarga(archivoId: number): string {
    return `${this.base}/desembolsos/archivos-planos/${archivoId}/descargar`;
  }
}
