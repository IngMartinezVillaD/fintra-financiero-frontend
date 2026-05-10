export function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function daysBetween(from: string | Date, to: string | Date): number {
  const a = typeof from === 'string' ? fromIsoDate(from) : from;
  const b = typeof to   === 'string' ? fromIsoDate(to)   : to;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
