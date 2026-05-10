import { Component, input } from '@angular/core';

export type BadgeSeverity = 'pending' | 'active' | 'success' | 'warning' | 'danger' | 'info';

const CLASSES: Record<BadgeSeverity, string> = {
  pending: 'badge-pending',
  active:  'badge-active',
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'bg-info-light text-info text-xs font-medium px-2.5 py-0.5 rounded-full',
};

const PIPELINE_LABELS: Record<string, { label: string; severity: BadgeSeverity }> = {
  CR: { label: 'Creación',        severity: 'pending' },
  AI: { label: 'Aprobación Int.', severity: 'active' },
  AE: { label: 'Aceptación Emp.', severity: 'active' },
  FD: { label: 'Firma Digital',   severity: 'warning' },
  DS: { label: 'Desembolsado',    severity: 'success' },
  RECHAZADA: { label: 'Rechazada', severity: 'danger' },
  CANCELADA: { label: 'Cancelada', severity: 'danger' },
};

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="badgeClass()">{{ displayLabel() }}</span>`,
})
export class BadgeComponent {
  label = input<string>('');
  severity = input<BadgeSeverity>('pending');
  pipeline = input<string | null>(null);

  protected badgeClass() {
    const sev = this.pipeline()
      ? (PIPELINE_LABELS[this.pipeline()!]?.severity ?? 'pending')
      : this.severity();
    return CLASSES[sev];
  }

  protected displayLabel() {
    return this.pipeline()
      ? (PIPELINE_LABELS[this.pipeline()!]?.label ?? this.pipeline())
      : this.label();
  }
}
