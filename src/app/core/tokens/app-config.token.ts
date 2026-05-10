import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

export interface AppConfig {
  apiBaseUrl: string;
  enableSwaggerLink: boolean;
  loggingLevel: string;
  featureFlags: Record<string, boolean>;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
