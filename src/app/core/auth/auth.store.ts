import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthData, AuthService, LoginRequest } from './auth.service';

export interface AuthState {
  user: { username: string; nombre: string; roles: string[] } | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => { try { const r = sessionStorage.getItem('user'); return r ? JSON.parse(r) : null; } catch { return null; } })(),
  accessToken: sessionStorage.getItem('accessToken'),
  refreshToken: sessionStorage.getItem('refreshToken'),
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(store => ({
    isAuthenticated: computed(() => !!store.accessToken()),
    userRoles: computed(() => store.user()?.roles ?? []),
    hasRole: computed(() => (role: string) => store.user()?.roles.includes(role) ?? false),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(req => authService.login(req).pipe(
          tapResponse({
            next: (data: AuthData) => {
              const user = { username: data.username, nombre: data.nombre, roles: data.roles ?? [] };
              sessionStorage.setItem('accessToken', data.accessToken);
              sessionStorage.setItem('refreshToken', data.refreshToken);
              sessionStorage.setItem('user', JSON.stringify(user));
              patchState(store, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user,
                loading: false,
                error: null,
              });
              router.navigate(['/']);
            },
            error: () => {
              patchState(store, { loading: false, error: 'Credenciales inválidas' });
            },
          })
        ))
      )
    ),
    logout() {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      patchState(store, { user: null, accessToken: null, refreshToken: null });
      router.navigate(['/login']);
    },
    setTokens(accessToken: string, refreshToken: string) {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      patchState(store, { accessToken, refreshToken });
    },
  }))
);
