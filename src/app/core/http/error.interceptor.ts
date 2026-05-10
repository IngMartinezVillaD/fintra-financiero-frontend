import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationStore } from '../notifications/notification.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationStore);

  return next(req).pipe(
    catchError(err => {
      const body = err.error;
      const message = body?.message ?? 'Ha ocurrido un error inesperado';
      const traceId = err.headers?.get('x-trace-id') ?? undefined;

      if (err.status >= 500) {
        notifications.push({ severity: 'error', title: 'Error del servidor', message, traceId });
      } else if (err.status === 403) {
        notifications.push({ severity: 'warning', title: 'Sin permisos', message: 'No tiene permisos para esta acción' });
      } else if (err.status === 400) {
        const errors: string[] = body?.errors ?? [];
        notifications.push({ severity: 'warning', title: 'Datos inválidos', message: errors.join(', ') || message });
      } else if (err.status !== 401) {
        notifications.push({ severity: 'error', title: 'Error', message });
      }

      return throwError(() => err);
    })
  );
};
