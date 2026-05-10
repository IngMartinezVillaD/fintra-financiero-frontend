import { AbstractControl, FormGroup } from '@angular/forms';

export function applyErrors(form: FormGroup, errors: Record<string, string[]>): void {
  Object.entries(errors).forEach(([field, messages]) => {
    const control = form.get(field);
    if (control) {
      control.setErrors({ serverError: messages[0] });
      control.markAsTouched();
    }
  });
}

export function getErrorMessage(control: AbstractControl | null): string | null {
  if (!control?.errors || !control.touched) return null;
  const e = control.errors;
  if (e['required'])    return 'Este campo es obligatorio';
  if (e['minlength'])   return `Mínimo ${(e['minlength'] as { requiredLength: number }).requiredLength} caracteres`;
  if (e['maxlength'])   return `Máximo ${(e['maxlength'] as { requiredLength: number }).requiredLength} caracteres`;
  if (e['email'])       return 'Correo electrónico inválido';
  if (e['pattern'])     return 'Formato inválido';
  if (e['min'])         return `Valor mínimo: ${(e['min'] as { min: number }).min}`;
  if (e['max'])         return `Valor máximo: ${(e['max'] as { max: number }).max}`;
  if (e['serverError']) return e['serverError'] as string;
  return 'Valor inválido';
}

export function markAllAsTouched(form: FormGroup): void {
  Object.values(form.controls).forEach(c => {
    c.markAsTouched();
    if (c instanceof FormGroup) markAllAsTouched(c);
  });
}
