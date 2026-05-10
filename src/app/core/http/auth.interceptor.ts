import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);

  const token = authStore.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && authStore.refreshToken()) {
        return authService.refresh(authStore.refreshToken()!).pipe(
          switchMap(res => {
            authStore.setTokens(res.accessToken, res.refreshToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
          }),
          catchError(() => {
            authStore.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
