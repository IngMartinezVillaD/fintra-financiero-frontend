export type LiquidacionEstado =
  'BORRADOR' | 'PENDIENTE_APROBACION' | 'APROBADA' | 'CONTABILIZADA';

export interface LiquidacionDetalleItem {
  id: number;
  operacionId: number;
  referencia: string | null;
  empresaPrestatariaNombre: string | null;
  empresaPrestamistaNombre: string | null;
  interesesPeriodo: string;
  retencionFuenteAplicada: string;
  retencionIcaAplicada: string;
  netoCobrar: string;
}

export interface LiquidacionMensual {
  id: number;
  anio: number;
  mes: number;
  periodo: string;
  fechaCorte: string;
  estado: LiquidacionEstado;
  totalInteresesLiquidados: string;
  totalRetencionFuente: string;
  totalRetencionIca: string;
  totalNetoCobrar: string;
  aprobadaPorNombre: string | null;
  aprobadaAt: string | null;
  createdAt: string;
  detalle: LiquidacionDetalleItem[];
}

export const LIQUIDACION_ESTADO_LABEL: Record<LiquidacionEstado, string> = {
  BORRADOR:              'Borrador',
  PENDIENTE_APROBACION:  'Pendiente aprobación',
  APROBADA:              'Aprobada',
  CONTABILIZADA:         'Contabilizada',
};

export const LIQUIDACION_ESTADO_COLOR: Record<LiquidacionEstado, string> = {
  BORRADOR:              'bg-neutral-100 text-neutral-600',
  PENDIENTE_APROBACION:  'bg-amber-100 text-amber-700',
  APROBADA:              'bg-green-100 text-green-700',
  CONTABILIZADA:         'bg-blue-100 text-blue-700',
};
