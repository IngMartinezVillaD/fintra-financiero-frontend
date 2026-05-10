import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-accent',
  secondary: 'border border-brand-primary text-brand-primary hover:bg-brand-light focus:ring-brand-accent',
  ghost:     'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-300',
  danger:    'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="btnClass()"
      (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant  = input<ButtonVariant>('primary');
  size     = input<ButtonSize>('md');
  type     = input<'button' | 'submit' | 'reset'>('button');
  loading  = input(false);
  disabled = input(false);
  clicked  = output<MouseEvent>();

  protected btnClass(): string {
    return [
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      SIZES[this.size()],
      VARIANTS[this.variant()],
    ].join(' ');
  }
}
