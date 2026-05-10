import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from './auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-2xl">F</span>
          </div>
          <h1 class="text-2xl font-bold text-neutral-900">Fintra Financiero</h1>
          <p class="text-neutral-500 text-sm mt-1">Versión 1.0.0</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-neutral-700 mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="form-input"
              placeholder="usuario@fintra.co"
              autocomplete="username">
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-input"
              placeholder="••••••••"
              autocomplete="current-password">
          </div>

          @if (authStore.error()) {
            <div class="bg-danger-light border border-danger text-danger text-sm rounded-lg p-3" role="alert">
              {{ authStore.error() }}
            </div>
          }

          <button
            type="submit"
            class="btn-primary w-full mt-6"
            [disabled]="form.invalid || authStore.loading()">
            @if (authStore.loading()) {
              <span>Ingresando...</span>
            } @else {
              <span>Ingresar</span>
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginPage {
  protected readonly authStore = inject(AuthStore);

  protected readonly form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  protected onSubmit(): void {
    if (this.form.valid) {
      this.authStore.login({
        username: this.form.value.username!,
        password: this.form.value.password!,
      });
    }
  }
}
