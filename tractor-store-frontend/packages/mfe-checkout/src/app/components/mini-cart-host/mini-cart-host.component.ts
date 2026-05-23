import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CATALOG_EVENTS,
  CartUpdatedPayload,
  catalogEventBus,
  remoteEntryTokenProviders,
} from '@tractor-store/shared-catalog';
import { MiniCartComponent } from '@tractor-store/ts-design-system';
import { CheckoutApiService } from '../../data/checkout-api.service';
import { CheckoutFacade } from '../../store/checkout.facade';

@Component({
  selector: 'checkout-mini-cart-host',
  standalone: true,
  imports: [MiniCartComponent],
  providers: [...remoteEntryTokenProviders, CheckoutApiService, CheckoutFacade],
  template: `
    <ts-mini-cart
      [itemCount]="facade.itemCount()"
      [subtotal]="facade.subtotal()"
      (navigate)="goToCart()"
    />
  `,
})
export class MiniCartHostComponent implements OnInit, OnDestroy {
  readonly facade = inject(CheckoutFacade);
  private readonly router = inject(Router);
  private unsubscribeCartEvents?: () => void;

  ngOnInit(): void {
    this.facade.loadCart();
    this.unsubscribeCartEvents = catalogEventBus.on<CartUpdatedPayload>(
      CATALOG_EVENTS.CART_UPDATED,
      (payload) => {
        this.facade.syncFromBus(payload);
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeCartEvents?.();
  }

  goToCart(): void {
    void this.router.navigate(['/checkout/cart']);
  }
}
