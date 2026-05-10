import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { toDecimal } from '../../utils/decimal.utils';

@Component({
  selector: 'app-money-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MoneyInputComponent),
    multi: true,
  }],
  template: `
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm select-none">$</span>
      <input
        type="text"
        inputmode="decimal"
        [placeholder]="placeholder()"
        [disabled]="isDisabled"
        [value]="displayValue"
        class="form-input pl-7 text-right tabular-nums"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()" />
    </div>
  `,
})
export class MoneyInputComponent implements ControlValueAccessor {
  placeholder = input('0,00');

  protected displayValue = '';
  protected isDisabled   = false;

  private rawValue = '';
  private readonly formatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private onChange    = (_: string) => {};
  protected onTouched = () => {};

  writeValue(val: string | number | null): void {
    if (val === null || val === undefined || val === '') {
      this.rawValue = '';
      this.displayValue = '';
      return;
    }
    this.rawValue = String(val);
    this.displayValue = this.formatter.format(toDecimal(val).toNumber());
  }

  registerOnChange(fn: (_: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void          { this.onTouched = fn; }
  setDisabledState(d: boolean): void               { this.isDisabled = d; }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/[^\d,]/g, '');
    this.displayValue = raw;
    this.rawValue = raw.replace(',', '.');
    this.onChange(this.rawValue);
  }

  protected onFocus(): void {
    this.displayValue = this.rawValue;
  }

  protected onBlur(): void {
    this.onTouched();
    if (this.rawValue) {
      try {
        this.displayValue = this.formatter.format(toDecimal(this.rawValue).toNumber());
      } catch {
        this.displayValue = this.rawValue;
      }
    }
  }
}
