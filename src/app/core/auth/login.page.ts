import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from './auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div class="flex w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden bg-white" style="max-height: 90vh">

        <!-- Panel izquierdo — color Fintra -->
        <div class="relative hidden md:flex flex-auto items-center justify-center p-16 overflow-hidden bg-brand-primary">

          <!-- Círculos decorativos -->
          <svg viewBox="0 0 960 540" width="100%" height="100%"
               preserveAspectRatio="xMidYMax slice"
               class="absolute inset-0 pointer-events-none text-white">
            <g fill="none" stroke="currentColor" stroke-width="100" class="opacity-25">
              <circle r="234" cx="196" cy="23"/>
              <circle r="234" cx="790" cy="491"/>
            </g>
          </svg>

          <!-- Patrón de puntos (esquina superior derecha) -->
          <svg viewBox="0 0 220 192" width="220" height="192" fill="none"
               class="absolute -top-16 -right-16 text-white opacity-40">
            <defs>
              <pattern id="login-dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="220" height="192" fill="url(#login-dot-pattern)"/>
          </svg>

          <!-- Contenido -->
          <div class="z-10 relative w-full max-w-sm">
            <div class="text-5xl font-bold leading-tight text-white">
              <div>Bienvenido a</div>
              <div class="mt-1">Fintra Financiero</div>
            </div>
            <p class="mt-6 text-base leading-relaxed text-white/75">
              Gestiona de forma eficiente las operaciones de crédito entre empresas relacionadas del grupo.
            </p>
          </div>
        </div>

        <!-- Panel derecho — formulario -->
        <div class="w-full md:w-auto md:min-w-96 flex items-center justify-center py-10 px-8 sm:px-12 bg-white">
          <div class="w-full max-w-80">

            <!-- Logo (solo móvil) -->
            <div class="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-8 md:hidden">
              <span class="text-white font-bold text-xl">F</span>
            </div>

            <h1 class="text-3xl font-bold tracking-tight text-neutral-900">Iniciar sesión</h1>
            <p class="mt-1 text-sm text-neutral-500">Por favor, ingresa tus datos</p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-5">
              <div>
                <label for="username" class="block text-sm font-medium text-neutral-700 mb-1.5">
                  Usuario <span class="text-danger" aria-hidden="true">*</span>
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
                <label for="password" class="block text-sm font-medium text-neutral-700 mb-1.5">
                  Contraseña <span class="text-danger" aria-hidden="true">*</span>
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
                <div class="bg-danger-light border border-danger/30 text-danger text-sm rounded-lg p-3" role="alert">
                  {{ authStore.error() }}
                </div>
              }

              <button
                type="submit"
                class="btn-primary w-full mt-2 py-2.5"
                [disabled]="form.invalid || authStore.loading()">
                @if (authStore.loading()) {
                  <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Ingresando...
                } @else {
                  Ingresar
                }
              </button>
            </form>

            <p class="mt-10 text-xs text-neutral-400 text-right">Versión 1.0.0 &nbsp;|&nbsp; 2025</p>
          </div>
        </div>

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
