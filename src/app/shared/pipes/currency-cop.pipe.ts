import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyCop', standalone: true })
export class CurrencyCopPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '$ —';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$ —';
    return this.formatter.format(num);
  }
}
