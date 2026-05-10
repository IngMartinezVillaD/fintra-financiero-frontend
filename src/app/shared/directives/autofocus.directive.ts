import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit {
  readonly appAutofocus = input(true);
  private readonly el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    if (this.appAutofocus()) {
      setTimeout(() => (this.el.nativeElement as HTMLElement).focus(), 0);
    }
  }
}
