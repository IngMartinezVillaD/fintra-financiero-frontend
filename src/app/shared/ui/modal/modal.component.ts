import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">

        <!-- Backdrop -->
        <div class="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
             (click)="closed.emit()"></div>

        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 [id]="titleId" class="text-lg font-semibold text-neutral-900">{{ title() }}</h2>
            <button (click)="closed.emit()"
                    class="text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Cerrar">
              ✕
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-neutral-100">
            <ng-content select="[slot=footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  open  = input(false);
  title = input('');
  closed = output();
  protected titleId = `modal-title-${Math.random().toString(36).slice(2)}`;
}
