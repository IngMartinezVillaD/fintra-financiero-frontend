import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AlertaBloqueoComponent } from '../../features/configuracion/tasas-periodo/ui/alerta-bloqueo.component';
import { ToastComponent } from '../../shared/ui/toast/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, AlertaBloqueoComponent, ToastComponent],
  template: `
    <div class="flex h-screen bg-neutral-50 overflow-hidden">
      <app-sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar />
        <app-alerta-bloqueo />
        <main class="flex-1 overflow-auto p-3 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast />
  `,
})
export class ShellPage {}
