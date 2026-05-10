import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  username: string;
  nombre: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/auth`;

  login(req: LoginRequest): Observable<AuthData> {
    return this.http.post<ApiResponse<AuthData>>(`${this.base}/login`, req)
      .pipe(map(res => res.data));
  }

  refresh(refreshToken: string): Observable<AuthData> {
    return this.http.post<ApiResponse<AuthData>>(`${this.base}/refresh`, { refreshToken })
      .pipe(map(res => res.data));
  }
}
