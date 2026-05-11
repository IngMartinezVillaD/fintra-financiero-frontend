import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Abono, RegistrarAbonoRequest, RegistrarAbonoResponse,
  SaldosSeparados, SeguimientoOperacion, Tramo
} from '../domain/seguimiento.model';
import { OperacionListItem } from '../../domain/operacion.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  listarVigentes(): Observable<OperacionListItem[]> {
    return this.http.get<ApiResponse<OperacionListItem[]>>(
      `${this.base}/operaciones/seguimiento`).pipe(map(r => r.data));
  }

  obtener(id: number): Observable<SeguimientoOperacion> {
    return this.http.get<ApiResponse<SeguimientoOperacion>>(
      `${this.base}/operaciones/${id}/seguimiento`).pipe(map(r => r.data));
  }

  saldos(id: number): Observable<SaldosSeparados> {
    return this.http.get<ApiResponse<SaldosSeparados>>(
      `${this.base}/operaciones/${id}/saldos`).pipe(map(r => r.data));
  }

  tramos(id: number): Observable<Tramo[]> {
    return this.http.get<ApiResponse<Tramo[]>>(
      `${this.base}/operaciones/${id}/tramos`).pipe(map(r => r.data));
  }

  abonos(id: number): Observable<Abono[]> {
    return this.http.get<ApiResponse<Abono[]>>(
      `${this.base}/operaciones/${id}/abonos`).pipe(map(r => r.data));
  }

  previewAbono(id: number, req: RegistrarAbonoRequest): Observable<RegistrarAbonoResponse> {
    return this.http.post<ApiResponse<RegistrarAbonoResponse>>(
      `${this.base}/operaciones/${id}/abonos/preview`, req).pipe(map(r => r.data));
  }

  registrarAbono(id: number, req: RegistrarAbonoRequest): Observable<RegistrarAbonoResponse> {
    return this.http.post<ApiResponse<RegistrarAbonoResponse>>(
      `${this.base}/operaciones/${id}/abonos`, req).pipe(map(r => r.data));
  }
}
