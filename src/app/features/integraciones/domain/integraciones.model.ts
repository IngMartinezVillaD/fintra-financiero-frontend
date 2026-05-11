export type IntegracionEstadoTipo = 'OK' | 'DEGRADADO' | 'CAIDO' | 'DESACTIVADO';

export interface IntegracionEstado {
  nombre: string;
  estado: IntegracionEstadoTipo;
  activo: boolean;
  enviosExitosos24h: number;
  errores24h: number;
  ultimoMensaje: string | null;
  ultimaActividad: string | null;
}

export interface NotificacionHistorial {
  id: number;
  eventoCodigo: string;
  estado: 'PENDIENTE' | 'ENVIADA' | 'ERROR';
  reintentos: number;
  ultimoError: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ESTADO_COLOR: Record<IntegracionEstadoTipo, string> = {
  OK:           'bg-green-100 text-green-700',
  DEGRADADO:    'bg-amber-100 text-amber-700',
  CAIDO:        'bg-red-100 text-red-700',
  DESACTIVADO:  'bg-neutral-100 text-neutral-500',
};

export const ESTADO_ICON: Record<IntegracionEstadoTipo, string> = {
  OK:          'check_circle',
  DEGRADADO:   'warning',
  CAIDO:       'cancel',
  DESACTIVADO: 'pause_circle',
};
