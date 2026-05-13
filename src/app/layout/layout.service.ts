import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly collapsed = signal(typeof window !== 'undefined' && window.innerWidth < 768);

  toggle() { this.collapsed.update(v => !v); }
}
