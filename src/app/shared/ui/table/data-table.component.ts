import { Component, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="overflow-x-auto rounded-xl border border-neutral-200">
      <table class="w-full text-sm text-left">
        <thead class="bg-neutral-50 border-b border-neutral-200">
          <tr>
            @for (col of columns(); track col.key) {
              <th class="px-4 py-3 font-medium text-neutral-600 whitespace-nowrap"
                  [class.text-center]="col.align === 'center'"
                  [class.text-right]="col.align === 'right'">
                {{ col.label }}
              </th>
            }
            @if (hasActions()) {
              <th class="px-4 py-3 font-medium text-neutral-600 w-16 text-center">Acciones</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          @if (loading()) {
            @for (i of skeletonRows; track i) {
              <tr>
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3">
                    <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
                  </td>
                }
              </tr>
            }
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)"
                  class="px-4 py-12 text-center text-neutral-400">
                Sin datos
              </td>
            </tr>
          } @else {
            @for (row of data(); track $index) {
              <tr class="hover:bg-neutral-50 transition-colors">
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3 text-neutral-700"
                      [class.text-center]="col.align === 'center'"
                      [class.text-right]="col.align === 'right'">
                    {{ row[col.key] }}
                  </td>
                }
                @if (hasActions()) {
                  <td class="px-4 py-3 text-center">
                    <ng-content select="[slot=actions]" />
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    @if (totalPages() > 1) {
      <div class="flex items-center justify-between mt-4 text-sm text-neutral-600">
        <span>Página {{ currentPage() }} de {{ totalPages() }}</span>
        <div class="flex gap-2">
          <button class="btn-secondary px-3 py-1 text-xs"
                  [disabled]="currentPage() === 1"
                  (click)="pageChange.emit(currentPage() - 1)">Anterior</button>
          <button class="btn-secondary px-3 py-1 text-xs"
                  [disabled]="currentPage() === totalPages()"
                  (click)="pageChange.emit(currentPage() + 1)">Siguiente</button>
        </div>
      </div>
    }
  `,
})
export class DataTableComponent {
  columns    = input<TableColumn[]>([]);
  data       = input<Record<string, unknown>[]>([]);
  loading    = input(false);
  hasActions = input(false);
  currentPage = input(1);
  totalPages  = input(1);
  pageChange  = output<number>();

  protected skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8];
}
