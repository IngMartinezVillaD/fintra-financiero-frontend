import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({ name: 'dateLong', standalone: true })
export class DateLongPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    return formatDate(value, "d 'de' MMMM 'de' yyyy", 'es-CO');
  }
}
