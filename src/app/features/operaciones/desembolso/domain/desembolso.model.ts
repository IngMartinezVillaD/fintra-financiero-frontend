export interface GmfResumen {
  aplica: boolean;
  monto: string;
  tarifa: string;
  motivoExencion: string | null;
}

export interface TramoInicial {
  id: number;
  numeroTramo: number;
  fechaDesde: string;
  fechaHasta: string;
  dias: number;
  saldoCapital: string;
  tasaPorcentajeMensual: string;
  tipoTasa: string;
  interesCalculado: string;
}

export interface Desembolso {
  id: number;
  operacionId: number;
  referencia: string | null;
  monto: string;
  fecha: string;
  gmfAplica: boolean;
  gmfCalculado: string;
  archivoPlanoId: number | null;
  createdAt: string;
  tramoInicial: TramoInicial | null;
}

export interface ArchivoPlano {
  id: number;
  bancoCodigo: string;
  bancoNombre: string;
  formato: string;
  totalRegistros: number;
  totalMonto: string;
  fechaGeneracion: string;
  operacionIds: number[];
  urlDescarga: string;
}

export interface ConfirmarDesembolsoRequest {
  monto: string;
  fecha?: string;
}

export interface GenerarArchivoPlanoRequest {
  fechaDesembolso: string;
  operacionIds: number[];
}
