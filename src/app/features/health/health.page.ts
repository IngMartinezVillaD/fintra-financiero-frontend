import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '@env/environment';
import { map } from 'rxjs';

interface HealthStatus {
  status: string;
  timestamp: string;
  db: string;
}

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-neutral-900 mb-6">Estado del Sistema</h1>

      @if (loading()) {
        <div class="card animate-pulse">
          <div class="h-4 bg-neutral-200 rounded w-1/3 mb-3"></div>
          <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
      } @else if (status()) {
        <div class="card">
          <div class="flex items-center gap-3 mb-6">
            <div [class]="status()!.status === 'UP' ? 'bg-success' : 'bg-danger'"
                 class="w-3 h-3 rounded-full"></div>
            <h2 class="text-lg font-semibold">
              Backend:
              <span [class]="status()!.status === 'UP' ? 'text-success' : 'text-danger'">
                {{ status()!.status }}
              </span>
            </h2>
          </div>

          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-neutral-500">Base de Datos</dt>
              <dd class="font-medium" [class]="status()!.db === 'UP' ? 'text-success' : 'text-danger'">
                {{ status()!.db }}
              </dd>
            </div>
            <div>
              <dt class="text-sm text-neutral-500">Timestamp</dt>
              <dd class="font-medium text-sm text-neutral-700">
                {{ status()!.timestamp | date:'medium' }}
              </dd>
            </div>
          </dl>
        </div>
      } @else if (error()) {
        <div class="card border-danger bg-danger-light">
          <p class="text-danger font-medium">No se pudo conectar al backend</p>
          <p class="text-sm text-neutral-600 mt-1">{{ error() }}</p>
          <button (click)="load()" class="btn-secondary mt-4 text-sm">Reintentar</button>
        </div>
      }

      <p class="mt-4 text-xs text-neutral-400">URL: {{ apiUrl }}</p>
    </div>
  `,
})
export class HealthPage implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly apiUrl = `${environment.apiBaseUrl}/health-check`;

  protected status = signal<HealthStatus | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  ngOnInit() { this.load(); }

  protected load() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<{ code: number; message: string; data: HealthStatus }>(this.apiUrl)
      .pipe(map(res => res.data))
      .subscribe({
        next: s => { this.status.set(s); this.loading.set(false); },
        error: e => { this.error.set(e.message); this.loading.set(false); },
      });
  }
}
