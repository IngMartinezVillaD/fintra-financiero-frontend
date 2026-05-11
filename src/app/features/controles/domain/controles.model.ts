export interface GmfMovimientoItem {
  id: number;
  operacionId: number;
  referencia: string | null;
  anio: number;
  mes: number;
  fecha: string;
  montoGmf: string;
  decisionAnual: 'PENDIENTE' | 'COBRAR' | 'ASUMIR';
}

export interface GmfEmpresa {
  empresaId: number;
  razonSocial: string;
  anio: number;
  totalGmf: string;
  decisionAnual: 'PENDIENTE' | 'COBRAR' | 'ASUMIR';
  movimientos: GmfMovimientoItem[];
}

export interface PresuntoMensualItem {
  id: number;
  operacionId: number;
  referencia: string | null;
  mes: number;
  saldoCapitalPromedio: string;
  tasaPresuntaPorcentaje: string;
  dias: number;
  montoCalculado: string;
}

export interface PresuntoEmpresa {
  empresaId: number;
  razonSocial: string;
  anio: number;
  totalPresuntoAnual: string;
  mensual: PresuntoMensualItem[];
}

export const MESES = [
  '', 'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

export const DECISION_COLOR: Record<string, string> = {
  PENDIENTE: 'bg-neutral-100 text-neutral-500',
  COBRAR:    'bg-amber-100 text-amber-700',
  ASUMIR:    'bg-blue-100 text-blue-700',
};
