import { Directive, HostListener, OnDestroy, output } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Directive({
  selector: '[debounceClick]',
  standalone: true,
})
export class DebounceClickDirective implements OnDestroy {
  readonly clicked = output<MouseEvent>();

  private readonly clicks$ = new Subject<MouseEvent>();
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.clicks$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(e => this.clicked.emit(e));
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    this.clicks$.next(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
