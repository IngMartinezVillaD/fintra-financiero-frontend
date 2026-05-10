import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

registerLocaleData(localeEsCo, 'es-CO');

export const localeProviders = [
  { provide: LOCALE_ID, useValue: 'es-CO' },
];
