import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           role="alertdialog" aria-modal="true"
           [attr.aria-labelledby]="dialogId + '-title'">
        <div class="absolute inset-0 bg-neutral-900/50" (click)="cancelled.emit()"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-warning text-2xl mt-0.5">warning</span>
            <div>
              <h3 [id]="dialogId + '-title'" class="font-semibold text-neutral-900">{{ title() }}</h3>
              <p class="text-sm text-neutral-500 mt-1">{{ message() }}</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <app-button variant="ghost" (clicked)="cancelled.emit()">{{ cancelLabel() }}</app-button>
            <app-button variant="danger" [loading]="loading()" (clicked)="confirmed.emit()">
              {{ confirmLabel() }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  open         = input(false);
  title        = input('¿Confirmar acción?');
  message      = input('Esta acción no se puede deshacer.');
  confirmLabel = input('Confirmar');
  cancelLabel  = input('Cancelar');
  loading      = input(false);
  confirmed    = output();
  cancelled    = output();

  protected readonly dialogId = `confirm-${Math.random().toString(36).slice(2)}`;
}
