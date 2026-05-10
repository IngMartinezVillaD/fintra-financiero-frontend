import { HttpInterceptorFn } from '@angular/common/http';

export const traceInterceptor: HttpInterceptorFn = (req, next) => {
  const traceId = crypto.randomUUID();
  return next(req.clone({ setHeaders: { 'X-Trace-Id': traceId } }));
};
