import { Component, input } from '@angular/core';

export type PipelineStep = 'CR' | 'AI' | 'AE' | 'FD' | 'DS' | 'RECHAZADA' | 'CANCELADA';

const STEPS = [
  { key: 'CR' as const, label: 'Creación',        icon: 'edit_document' },
  { key: 'AI' as const, label: 'Aprobación Int.', icon: 'verified_user' },
  { key: 'AE' as const, label: 'Aceptación Emp.', icon: 'handshake' },
  { key: 'FD' as const, label: 'Firma Digital',   icon: 'draw' },
  { key: 'DS' as const, label: 'Desembolso',      icon: 'payments' },
];

@Component({
  selector: 'app-pipeline-stepper',
  standalone: true,
  template: `
    <div class="flex items-start gap-0" role="list" aria-label="Etapas de la operación">
      @for (step of steps; track step.key; let last = $last) {
        <div class="flex items-center" role="listitem">
          <div class="flex flex-col items-center">
            <div [class]="circleClass(step.key)"
                 class="w-9 h-9 rounded-full flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined text-base">{{ step.icon }}</span>
            </div>
            <span class="text-xs mt-1 text-center w-16 leading-tight"
                  [class]="labelClass(step.key)">{{ step.label }}</span>
          </div>
          @if (!last) {
            <div [class]="connectorClass(step.key)"
                 class="h-0.5 w-8 mx-1 mb-5 transition-colors"></div>
          }
        </div>
      }
    </div>
  `,
})
export class PipelineStepperComponent {
  current  = input<PipelineStep>('CR');
  rejected = input(false);

  protected readonly steps = STEPS;

  private indexOf(key: PipelineStep): number {
    return STEPS.findIndex(s => s.key === key);
  }

  protected circleClass(key: PipelineStep): string {
    const ci = this.indexOf(this.current());
    const si = this.indexOf(key);
    if (this.rejected() && si === ci) return 'bg-danger text-white';
    if (si < ci)  return 'bg-success text-white';
    if (si === ci) return 'bg-brand-primary text-white';
    return 'bg-neutral-200 text-neutral-400';
  }

  protected labelClass(key: PipelineStep): string {
    const ci = this.indexOf(this.current());
    const si = this.indexOf(key);
    return si <= ci ? 'text-neutral-700 font-medium' : 'text-neutral-400';
  }

  protected connectorClass(key: PipelineStep): string {
    const ci = this.indexOf(this.current());
    const si = this.indexOf(key);
    return si < ci ? 'bg-success' : 'bg-neutral-200';
  }
}
