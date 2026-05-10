import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

export function toDecimal(value: string | number | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') return new Decimal(0);
  return new Decimal(value);
}

export function formatCop(value: string | number | null | undefined): string {
  const d = toDecimal(value);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(d.toNumber());
}

export function calcularInteres(
  capital: string,
  tasaMensual: string,
  dias: number
): Decimal {
  const c = toDecimal(capital);
  const t = toDecimal(tasaMensual).div(100);
  return c.mul(t).mul(new Decimal(dias).div(30)).toDecimalPlaces(6);
}
