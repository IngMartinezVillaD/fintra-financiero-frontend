import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({ name: 'dateShort', standalone: true })
export class DateShortPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    return formatDate(value, 'dd/MM/yyyy', 'es-CO');
  }
}
