import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true,
  }],
  template: `
    <select
      [disabled]="isDisabled"
      class="form-input"
      (change)="onSelect($event)"
      (blur)="onTouched()">
      @if (placeholder()) {
        <option value="" [selected]="value === null || value === ''">{{ placeholder() }}</option>
      }
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value"
                [disabled]="opt.disabled ?? false"
                [selected]="opt.value === value">
          {{ opt.label }}
        </option>
      }
    </select>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  options     = input<SelectOption[]>([]);
  placeholder = input('');

  protected value: string | number | null = null;
  protected isDisabled = false;

  private onChange    = (_: string | number | null) => {};
  protected onTouched = () => {};

  writeValue(val: string | number | null): void { this.value = val; }
  registerOnChange(fn: (_: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void       { this.isDisabled = d; }

  protected onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
}
