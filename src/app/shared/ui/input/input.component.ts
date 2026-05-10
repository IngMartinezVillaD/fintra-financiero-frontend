import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'number' | 'email' | 'password' | 'search' | 'date';

@Component({
  selector: 'app-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
  template: `
    <input
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled"
      [value]="value"
      class="form-input"
      (input)="onInput($event)"
      (blur)="onTouched()" />
  `,
})
export class InputComponent implements ControlValueAccessor {
  type        = input<InputType>('text');
  placeholder = input('');

  protected value      = '';
  protected isDisabled = false;

  private onChange   = (_: string) => {};
  protected onTouched = () => {};

  writeValue(val: string): void           { this.value = val ?? ''; }
  registerOnChange(fn: (_: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void  { this.onTouched = fn; }
  setDisabledState(d: boolean): void       { this.isDisabled = d; }

  protected onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
}
