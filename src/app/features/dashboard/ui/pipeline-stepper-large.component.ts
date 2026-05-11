import { Component, input } from '@angular/core';
import { PipelineConteo, PIPELINE_ETAPAS } from '../domain/dashboard.model';

@Component({
  selector: 'app-pipeline-stepper-large',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="text-sm font-semibold text-neutral-600 mb-4">Pipeline de operaciones</h3>
      <div class="grid grid-cols-5 gap-2">
        @for (etapa of etapas; track etapa.key) {
          <div class="flex flex-col items-center gap-2">
            <div class="rounded-xl px-3 py-3 text-center w-full transition-all"
                 [class]="etapa.color">
              <p class="text-2xl font-bold">{{ conteo()[etapa.key] ?? 0 }}</p>
              <p class="text-xs font-medium mt-0.5">{{ etapa.label }}</p>
            </div>
            @if (!$last) {
              <div class="hidden md:block w-full h-0.5 bg-neutral-200 relative">
                <div class="absolute inset-y-0 right-0 -mr-1 flex items-center">
                  <span class="text-neutral-300 text-xs">›</span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PipelineStepperLargeComponent {
  conteo = input<PipelineConteo>({ CR: 0, AI: 0, AE: 0, FD: 0, DS: 0 });
  etapas = PIPELINE_ETAPAS;
}
