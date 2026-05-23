import { Component, input } from '@angular/core';

@Component({
  selector: 'ts-cart-counter',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold rounded-full bg-accent text-brand-primary shadow-sm"
      [class.hidden]="count() === 0"
      aria-live="polite"
    >
      {{ count() }}
    </span>
  `,
})
export class CartCounterComponent {
  readonly count = input(0);
}
