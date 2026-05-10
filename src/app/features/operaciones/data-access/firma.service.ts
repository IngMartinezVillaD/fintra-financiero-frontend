import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface FirmaEstado {
  solicitudId: string;
  operacionId: number;
  estado: 'ENVIADA' | 'FIRMADA' | 'RECHAZADA' | 'EXPIRADA';
  destinatarioEmail: string;
  documentoUrl: string;
  enviadoAt: string | null;
  firmadoAt: string | null;
  createdAt: string;
}

interface ApiResponse<T> { code: number; message: string; data: T; }

export const FIRMA_ESTADO_LABEL: Record<string, string> = {
  ENVIADA:   'Enviado — esperando firma',
  FIRMADA:   'Firmado',
  RECHAZADA: 'Rechazado por el destinatario',
  EXPIRADA:  'Expirado — reenviar',
};

@Injectable({ providedIn: 'root' })
export class FirmaService {
  private readonly http = inject(HttpClient);

  private url(id: number) {
    return `${environment.apiBaseUrl}/operaciones/${id}/firma`;
  }

  consultarEstado(operacionId: number): Observable<FirmaEstado | null> {
    return this.http.get<ApiResponse<FirmaEstado | null>>(this.url(operacionId))
      .pipe(map(r => r.data));
  }

  iniciar(operacionId: number): Observable<FirmaEstado> {
    return this.http.post<ApiResponse<FirmaEstado>>(`${this.url(operacionId)}/iniciar`, {})
      .pipe(map(r => r.data));
  }

  reenviar(operacionId: number): Observable<FirmaEstado> {
    return this.http.post<ApiResponse<FirmaEstado>>(`${this.url(operacionId)}/reenviar`, {})
      .pipe(map(r => r.data));
  }
}
