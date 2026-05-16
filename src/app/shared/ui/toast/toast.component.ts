import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto
                 animate-in slide-in-from-right duration-200"
          [class]="severityClass(t)">
          <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">{{ severityIcon(t) }}</span>
          <p class="text-sm flex-1 leading-snug">{{ t.message }}</p>
          <button (click)="toast.dismiss(t.id)"
                  class="shrink-0 opacity-60 hover:opacity-100 transition-opacity -mr-1 -mt-0.5">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);

  protected severityClass(t: Toast): string {
    if (t.severity === 'success') return 'bg-green-50 border-green-200 text-green-800';
    if (t.severity === 'error')   return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  }

  protected severityIcon(t: Toast): string {
    if (t.severity === 'success') return 'check_circle';
    if (t.severity === 'error')   return 'error';
    return 'info';
  }
}
