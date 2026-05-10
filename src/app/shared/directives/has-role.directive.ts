import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly authStore = inject(AuthStore);
  private readonly tpl = inject(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);

  @Input() set hasRole(roles: string | string[]) {
    const required = Array.isArray(roles) ? roles : [roles];
    const userRoles = this.authStore.userRoles();
    const allowed = required.length === 0 || required.some(r => userRoles.includes(r));

    this.vcr.clear();
    if (allowed) this.vcr.createEmbeddedView(this.tpl);
  }
}
