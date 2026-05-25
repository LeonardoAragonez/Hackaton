import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'ts-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <article
      class="ts-vehicle-card group"
      (click)="selected.emit()"
      (keyup.enter)="selected.emit()"
      tabindex="0"
      role="button"
    >
      <img
        [src]="imageUrl()"
        [alt]="name()"
        loading="lazy"
      />
      <div class="ts-vehicle-card__overlay" aria-hidden="true"></div>
      <div class="ts-vehicle-card__body">
        <h3 class="ts-vehicle-card__name">{{ name() }}</h3>
        <p class="ts-vehicle-card__price">desde {{ price() | currency }}</p>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  readonly name = input.required<string>();
  readonly imageUrl = input.required<string>();
  readonly price = input.required<number>();
  readonly selected = output<void>();
}
