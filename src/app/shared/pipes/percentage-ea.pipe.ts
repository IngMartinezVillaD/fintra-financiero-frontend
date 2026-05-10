import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'percentageEa', standalone: true })
export class PercentageEaPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  transform(value: string | number | null | undefined, suffix = 'E.A.'): string {
    if (value === null || value === undefined || value === '') return '— %';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '— %';
    return `${this.formatter.format(num)}% ${suffix}`;
  }
}
