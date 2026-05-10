export type TipoTasa = 'USURA' | 'COMERCIAL_VIGENTE' | 'PRESUNTA_FISCAL';
export type EstadoTasa = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type EstadoBloqueo = 'OPERATIVO' | 'BLOQUEADO_GLOBAL' | 'BLOQUEADO_EMPRESA';

export interface TasaPeriodo {
  id: number;
  anio: number;
  mes: number;
  tipoTasa: TipoTasa;
  valorPorcentajeEfectivoAnual: string;
  valorPorcentajeMensual: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  estado: EstadoTasa;
  aprobadoPorNombre: string | null;
  aprobadoAt: string | null;
  observacionAprobacion: string | null;
  createdAt: string;
}

export interface BloqueoSistema {
  estado: EstadoBloqueo;
  motivo?: string;
  tasaTipo?: TipoTasa;
  vigenciaUltima?: string;
  ruta?: string;
  rutaLabel?: string;
}

export interface RegistrarTasaRequest {
  anio: number;
  mes: number;
  tipoTasa: TipoTasa;
  valorPorcentajeEfectivoAnual: string;
  valorPorcentajeMensual: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  observacion?: string;
}

export const TIPO_TASA_LABEL: Record<TipoTasa, string> = {
  USURA:             'Usura (Superfinanciera)',
  COMERCIAL_VIGENTE: 'Comercial Vigente',
  PRESUNTA_FISCAL:   'Presunta Fiscal',
};

export const MESES: Record<number, string> = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
  5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
  9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
};
