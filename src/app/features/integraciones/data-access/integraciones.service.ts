import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { IntegracionEstado, NotificacionHistorial } from '../domain/integraciones.model';

interface ApiResponse<T> { code: number; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class IntegracionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/integraciones`;

  estado(): Observable<IntegracionEstado[]> {
    return this.http.get<ApiResponse<IntegracionEstado[]>>(`${this.base}/estado`).pipe(map(r => r.data));
  }

  historialBitrix24(page = 0, size = 20): Observable<NotificacionHistorial[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<NotificacionHistorial[]>>(
      `${this.base}/bitrix24/historial`, { params }).pipe(map(r => r.data));
  }

  reenviar(id: number): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.base}/bitrix24/${id}/reenviar`, {})
      .pipe(map(r => r.data));
  }
}
