import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="space-y-1">
      @if (label()) {
        <label class="block text-sm font-medium text-neutral-700">
          {{ label() }}
          @if (required()) {
            <span class="text-danger ml-0.5" aria-hidden="true">*</span>
          }
        </label>
      }
      <ng-content />
      @if (error()) {
        <p class="text-xs text-danger flex items-center gap-1" role="alert">
          <span class="material-symbols-outlined text-sm">error</span>
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p class="text-xs text-neutral-400">{{ hint() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  label    = input('');
  hint     = input('');
  error    = input('');
  required = input(false);
}
