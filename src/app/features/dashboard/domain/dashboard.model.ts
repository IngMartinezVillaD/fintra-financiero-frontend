export interface PipelineConteo {
  CR: number;
  AI: number;
  AE: number;
  FD: number;
  DS: number;
}

export interface ConsolidadoFinanciero {
  derechosSaldoCapital: string;
  derechosIntereses: string;
  derechosTotal: string;
  obligacionesSaldoCapital: string;
  obligacionesIntereses: string;
  obligacionesTotal: string;
  exposicionNeta: string;
  totalOperacionesDs: number;
}

export interface Alerta {
  tipo: string;
  subtipo: string;
  empresaId: number | null;
  empresaRazonSocial: string | null;
  fechaVigenciaHasta: string;
  diasRestantes: number;
  estado: string;
}

export interface TasaVigente {
  tipoTasa: string;
  porcentajeEfectivoAnual: string;
  porcentajeMensual: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
}

export interface DashboardData {
  pipeline: PipelineConteo;
  consolidado: ConsolidadoFinanciero;
  alertas: Alerta[];
  tasasVigentes: TasaVigente[];
}

export interface EvolucionMensual {
  anio: number;
  mes: number;
  periodo: string;
  saldoCapital: string;
  interesesLiquidados: string;
  gmfAcumulado: string;
}

export interface KpiGerencial {
  diasPromedioAprobacion: number;
  operacionesRechazadas: number;
  operacionesActivas: number;
  operacionesEnPipeline: number;
  tasaPromedioPonderada: string;
}

export const PIPELINE_ETAPAS = [
  { key: 'CR', label: 'Creación',      color: 'bg-neutral-200 text-neutral-700' },
  { key: 'AI', label: 'Aprob. interna', color: 'bg-amber-100 text-amber-700' },
  { key: 'AE', label: 'Acept. empresa', color: 'bg-blue-100 text-blue-700' },
  { key: 'FD', label: 'Firma digital',  color: 'bg-purple-100 text-purple-700' },
  { key: 'DS', label: 'Desembolsado',   color: 'bg-green-100 text-green-700' },
];
