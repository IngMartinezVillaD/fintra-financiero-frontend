import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void { this.add(message, 'success'); }
  error(message: string):   void { this.add(message, 'error');   }
  info(message: string):    void { this.add(message, 'info');    }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(message: string, severity: ToastSeverity): void {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, message, severity }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
