export interface SaldosSeparados {
  saldoCapital: string;
  interesesCausados: string;
  interesEnCurso: string;
  gmfIncurrido: string;
  deudaTotal: string;
}

export interface Tramo {
  id: number;
  numeroTramo: number;
  tipoMovimiento: string;
  fechaDesde: string;
  fechaHasta: string;
  dias: number;
  saldoCapital: string;
  tasaPorcentajeMensual: string;
  tipoTasa: string;
  interesCalculado: string;
  estado: 'EN_CURSO' | 'LIQUIDADO' | 'ANULADO';
}

export interface Abono {
  id: number;
  fecha: string;
  montoTotal: string;
  aplicadoAIntereses: string;
  aplicadoACapital: string;
  numeroComprobante: string;
  observaciones: string | null;
  tramoLiquidadoId: number | null;
  createdAt: string;
}

export interface SeguimientoOperacion {
  id: number;
  referencia: string;
  empresaPrestamistaNombre: string;
  empresaPrestatariaNombre: string;
  cobraInteres: string;
  fechaDesembolso: string | null;
  montoDesembolsado: string | null;
  saldos: SaldosSeparados;
  tramos: Tramo[];
  abonos: Abono[];
}

export interface RegistrarAbonoRequest {
  fechaAbono: string;
  monto: string;
  numeroComprobante: string;
  observaciones?: string;
}

export interface RegistrarAbonoResponse {
  abono: Abono;
  tramoNuevo: Tramo | null;
  saldosActuales: SaldosSeparados;
  operacionSaldada: boolean;
}

export const TIPO_MOVIMIENTO_LABEL: Record<string, string> = {
  DESEMBOLSO_INICIAL:               'Desembolso inicial',
  LIQUIDACION_CIERRE_MES:           'Cierre de mes',
  LIQUIDACION_PARCIAL_CAMBIO_TASA:  'Cambio de tasa',
  LIQUIDACION_NUEVO_DESEMBOLSO:     'Nuevo desembolso',
  LIQUIDACION_POR_ABONO:            'Liquidación por abono',
};
