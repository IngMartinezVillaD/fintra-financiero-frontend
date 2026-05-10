export type EstadoPipeline = 'CR' | 'AI' | 'AE' | 'FD' | 'DS' | 'RECHAZADA' | 'CANCELADA';
export type CobraInteres = 'SI_COMERCIAL' | 'SI_ESPECIAL' | 'NO';

export interface AvisoTramoAnterior {
  operacionId: number;
  referencia: string;
  tramoId: number;
  saldoCapital: string;
  fechaDesdeTramo: string;
  diasTranscurridos: number;
  tasaMensual: string;
  tipoTasa: string;
  interesEstimado: string;
}

export interface EventoPipeline {
  estadoAnterior: string | null;
  estadoNuevo: string;
  usuario: string;
  observacion: string | null;
  ocurridoAt: string;
}

export interface OperacionListItem {
  id: number;
  referencia: string | null;
  empresaPrestamistaNombre: string;
  empresaPrestatariaNombre: string;
  cobraInteres: CobraInteres;
  montoEstimado: string | null;
  estadoPipeline: EstadoPipeline;
  fechaCreacion: string;
  creadoPor: string;
  diasEsperando: number;
}

export interface Operacion {
  id: number;
  referencia: string;
  empresaPrestamistaId: number;
  empresaPrestamistaNombre: string;
  empresaPrestamistaCodigoInterno: string;
  empresaPrestatariaId: number;
  empresaPrestatariaNombre: string;
  empresaPrestatariaCodigoInterno: string;
  cobraInteres: CobraInteres;
  cuentaOrigenId: number | null;
  cuentaOrigenDescripcion: string | null;
  cuentaDestinoId: number | null;
  cuentaDestinoDescripcion: string | null;
  montoEstimado: string | null;
  observaciones: string;
  numDocumentoSoporte: string;
  estadoPipeline: EstadoPipeline;
  fechaCreacion: string;
  creadoPor: string;
  aprobacionInternaAt: string | null;
  aprobacionInternaUsuario: string | null;
  aprobacionInternaObservacion: string | null;
  aceptacionEmpresaAt: string | null;
  aceptacionEmpresaUsuario: string | null;
  aceptacionEmpresaObservacion: string | null;
  firmaDigitalAt: string | null;
  desembolsoAt: string | null;
  eventos: EventoPipeline[];
  avisoTramoAnterior: AvisoTramoAnterior | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CrearOperacionRequest {
  empresaPrestamistaId: number;
  empresaPrestatariaId: number;
  cobraInteres: CobraInteres;
  cuentaOrigenId?: number;
  cuentaDestinoId?: number;
  montoEstimado?: string;
  observaciones: string;
  numDocumentoSoporte: string;
}
