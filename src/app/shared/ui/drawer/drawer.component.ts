import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm"
           (click)="closed.emit()"></div>
      <aside class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
             role="dialog" aria-modal="true">
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 class="text-lg font-semibold text-neutral-900">{{ title() }}</h2>
          <button (click)="closed.emit()"
                  class="text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Cerrar">✕</button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <ng-content />
        </div>
        <div class="px-6 py-4 border-t border-neutral-100">
          <ng-content select="[slot=footer]" />
        </div>
      </aside>
    }
  `,
})
export class DrawerComponent {
  open  = input(false);
  title = input('');
  closed = output();
}
