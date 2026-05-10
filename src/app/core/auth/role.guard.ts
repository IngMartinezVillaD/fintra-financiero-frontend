import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const roleGuard = (roles: string[]): CanMatchFn => () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const userRoles = authStore.userRoles();

  if (roles.some(r => userRoles.includes(r))) return true;

  router.navigate(['/forbidden']);
  return false;
};
