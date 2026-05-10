import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-3">
      @for (row of rows(); track $index) {
        <div class="h-4 bg-neutral-200 rounded" [style.width]="widths[$index % widths.length]"></div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  rows = input(3);
  protected widths = ['100%', '80%', '60%', '90%', '70%'];
}
