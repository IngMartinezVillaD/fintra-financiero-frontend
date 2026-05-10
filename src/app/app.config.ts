import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { traceInterceptor } from './core/http/trace.interceptor';

registerLocaleData(localeEsCo, 'es-CO');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor, traceInterceptor])
    ),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
};
