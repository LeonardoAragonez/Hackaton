import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ButtonComponent } from '@tractor-store/ts-design-system';
import { CheckoutFacade } from '../../store/checkout.facade';

@Component({
  selector: 'checkout-cart-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ButtonComponent],
  template: `
    <div class="py-12 ts-page-container max-w-2xl animate-slide-up">
      <div class="ts-section-header">
        <p class="ts-eyebrow">Tu pedido</p>
        <h1 class="ts-section-title">Carrito</h1>
      </div>
      @if (facade.cart()?.items?.length) {
        <div class="ts-panel mt-8">
          <ul class="space-y-3">
            @for (item of facade.cart()!.items; track item.sku) {
              <li class="ts-cart-item">
                <img [src]="facade.cdnUrl(item.image)" [alt]="item.name" class="ts-cart-item__thumb" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold uppercase tracking-wide text-sm">{{ item.name }}</p>
                  <p class="mt-0.5 text-sm text-text-muted">
                    {{ item.price | currency }} × {{ item.quantity }}
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  [value]="item.quantity"
                  class="ts-input w-16 text-center shrink-0"
                  (change)="onQty(item.sku, $event)"
                />
              </li>
            }
          </ul>
          <div class="ts-price-block">
            <span class="ts-form-label !mb-0">Total</span>
            <p class="ts-price !m-0">{{ facade.subtotal() | currency }}</p>
          </div>
          <a routerLink="/checkout/checkout" class="block">
            <ts-button variant="cta" class="block w-full">Finalizar compra</ts-button>
          </a>
        </div>
      } @else {
        <div class="ts-empty-state mt-8">
          <p class="font-display text-xl font-bold uppercase">Carrito vacío</p>
          <p class="mt-2 text-text-muted">Explora el catálogo y configura tu tractor</p>
          <a routerLink="/" class="inline-block mt-8 ts-btn-secondary">Ver catálogo</a>
        </div>
      }
    </div>
  `,
})
export class CartPageComponent implements OnInit {
  readonly facade = inject(CheckoutFacade);

  ngOnInit(): void {
    this.facade.loadCart();
  }

  onQty(sku: string, event: Event): void {
    const qty = Number((event.target as HTMLInputElement).value);
    this.facade.updateQuantity(sku, qty);
  }
}
