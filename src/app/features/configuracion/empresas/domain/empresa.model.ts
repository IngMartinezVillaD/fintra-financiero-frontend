export interface EmpresaListItem {
  id: number;
  codigoInterno: string;
  razonSocial: string;
  nit: string;
  rolPermitido: 'PRESTAMISTA' | 'PRESTATARIA' | 'AMBOS';
  estado: 'ACTIVA' | 'INACTIVA';
  erpUtilizado: string | null;
  cobraInteres: boolean;
  aplicaTasaEspecial: boolean;
  tieneTasaPendiente: boolean;
}

export interface CuentaBancaria {
  id: number;
  bancoCodigo: string;
  bancoNombre: string;
  tipo: 'CORRIENTE' | 'AHORROS';
  numeroCuenta: string;
  titular: string;
  codigoContable: string | null;
  formatoArchivoPlano: string | null;
  exentaGmf: boolean;
  activa: boolean;
}

export interface TasaEspecial {
  id: number;
  valorPorcentajeEfectivoAnual: string;
  valorPorcentajeMensual: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'VIGENTE' | 'VENCIDA' | 'RECHAZADA';
  aprobadoPorNombre: string | null;
  aprobadoAt: string | null;
  observacion: string | null;
  createdAt: string;
}

export interface Empresa {
  id: number;
  codigoInterno: string;
  razonSocial: string;
  nit: string;
  pais: string;
  ciudad: string | null;
  rolPermitido: string;
  estado: string;
  representanteLegalNombre: string | null;
  representanteLegalEmail: string | null;
  representanteLegalTelefono: string | null;
  erpUtilizado: string | null;
  cuentaCxcId: number | null;
  cuentaCxcCodigo: string | null;
  cuentaCxpId: number | null;
  cuentaCxpCodigo: string | null;
  centroUtilidad: string | null;
  saldoInicialCapital: string;
  saldoInicialIntereses: string;
  fechaCorteSaldoInicial: string | null;
  cobraInteres: boolean;
  calculaInteresPresunto: boolean;
  aplicaTasaEspecial: boolean;
  retencionFuentePorcentaje: string | null;
  retencionIcaPorcentaje: string | null;
  createdAt: string;
  updatedAt: string;
  cuentasBancarias: CuentaBancaria[];
  tasasEspeciales: TasaEspecial[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CrearEmpresaRequest {
  codigoInterno: string;
  razonSocial: string;
  nit: string;
  pais?: string;
  ciudad?: string;
  rolPermitido: string;
  representanteLegalNombre?: string;
  representanteLegalEmail?: string;
  representanteLegalTelefono?: string;
  erpUtilizado?: string;
  cuentaCxcId?: number;
  cuentaCxpId?: number;
  centroUtilidad?: string;
  saldoInicialCapital?: string;
  saldoInicialIntereses?: string;
  fechaCorteSaldoInicial?: string;
  cobraInteres?: boolean;
  calculaInteresPresunto?: boolean;
  aplicaTasaEspecial?: boolean;
  retencionFuentePorcentaje?: string;
  retencionIcaPorcentaje?: string;
}

export interface CuentaBancariaRequest {
  bancoCodigo: string;
  tipo: string;
  numeroCuenta: string;
  titular: string;
  codigoContable?: string;
  formatoArchivoPlano?: string;
  exentaGmf?: boolean;
}

export interface TasaEspecialRequest {
  valorPorcentajeEfectivoAnual: string;
  valorPorcentajeMensual: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  observacion?: string;
}
