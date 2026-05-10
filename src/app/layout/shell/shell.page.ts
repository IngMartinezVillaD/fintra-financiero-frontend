import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, BreadcrumbsComponent],
  template: `
    <div class="flex h-screen bg-neutral-50 overflow-hidden">
      <app-sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar />
        <main class="flex-1 overflow-auto p-6">
          <app-breadcrumbs />
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellPage {}
