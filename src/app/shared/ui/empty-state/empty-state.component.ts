import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <span class="material-symbols-outlined text-5xl text-neutral-300 mb-4">{{ icon() }}</span>
      <h3 class="text-base font-semibold text-neutral-600">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-neutral-400 mt-1 max-w-xs">{{ description() }}</p>
      }
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  icon        = input('inbox');
  title       = input('Sin resultados');
  description = input('');
}
