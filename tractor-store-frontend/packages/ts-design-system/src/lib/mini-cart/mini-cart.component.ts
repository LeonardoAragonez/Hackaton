import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartCounterComponent } from '../cart-counter/cart-counter.component';

@Component({
  selector: 'ts-mini-cart',
  standalone: true,
  imports: [CurrencyPipe, CartCounterComponent],
  template: `
    <button
      type="button"
      class="relative inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:text-brand-accent"
      (click)="navigate.emit()"
      aria-label="Abrir carrito"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9" />
      </svg>
      <ts-cart-counter [count]="itemCount()" />
      @if (subtotal() > 0) {
        <span class="font-semibold text-brand-accent">{{ subtotal() | currency }}</span>
      }
    </button>
  `,
})
export class MiniCartComponent {
  readonly itemCount = input(0);
  readonly subtotal = input(0);
  readonly navigate = output<void>();
}
