import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  CATALOG_EVENTS,
  CDN_BASE_URL,
  CartUpdatedPayload,
  catalogEventBus,
  FulfillmentType,
  PlaceOrderRequest,
  resolveCdnUrl,
} from '@tractor-store/shared-catalog';
import { CheckoutApiService } from '../data/checkout-api.service';
import { createCheckoutStore } from './checkout.state';
import { checkoutActions } from './checkout.actions';
import { checkoutSelectors } from './checkout.selectors';

@Injectable()
export class CheckoutFacade {
  private readonly api = inject(CheckoutApiService);
  private readonly router = inject(Router);
  private readonly cdn = inject(CDN_BASE_URL);
  private readonly store = createCheckoutStore();

  readonly cart = computed(() => checkoutSelectors.cart(this.store.state()));
  readonly stores = computed(() => checkoutSelectors.stores(this.store.state()));
  readonly loading = computed(() => checkoutSelectors.loading(this.store.state()));
  readonly error = computed(() => checkoutSelectors.error(this.store.state()));
  readonly orderId = computed(() => checkoutSelectors.orderId(this.store.state()));
  readonly orderConfirmation = computed(() =>
    checkoutSelectors.orderConfirmation(this.store.state())
  );
  readonly itemCount = computed(() => checkoutSelectors.itemCount(this.store.state()));
  readonly subtotal = computed(() => checkoutSelectors.subtotal(this.store.state()));

  cdnUrl(path: string): string {
    return resolveCdnUrl(path, this.cdn);
  }

  private emitCart(): void {
    catalogEventBus.emit(CATALOG_EVENTS.CART_UPDATED, {
      itemCount: this.itemCount(),
      subtotal: this.subtotal(),
    });
  }

  syncFromBus(payload: CartUpdatedPayload): void {
    this.store.state.update((s) => checkoutActions.syncCartBadge(s, payload));
  }

  loadCart(): void {
    this.store.state.update((s) => checkoutActions.loadStart(s));
    this.api.getCart().subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => checkoutActions.loadCartSuccess(s, result.value));
        this.emitCart();
      } else {
        this.store.state.update((s) => checkoutActions.setError(s, String(result.error)));
      }
    });
  }

  loadStores(): void {
    this.api.getStores().subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => checkoutActions.loadStoresSuccess(s, result.value));
      }
    });
  }

  updateQuantity(sku: string, quantity: number): void {
    this.api.updateQuantity(sku, quantity).subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => checkoutActions.loadCartSuccess(s, result.value));
        this.emitCart();
      }
    });
  }

  placeOrder(request: PlaceOrderRequest): void {
    this.store.state.update((s) => checkoutActions.loadStart(s));
    this.api.placeOrder(request).subscribe((result) => {
      if (result.ok) {
        const confirmation = result.value;
        this.api.getCart().subscribe((cartResult) => {
          if (cartResult.ok) {
            this.store.state.update((s) =>
              checkoutActions.orderSuccess(
                checkoutActions.loadCartSuccess(s, cartResult.value),
                confirmation
              )
            );
          } else {
            this.store.state.update((s) => checkoutActions.orderSuccess(s, confirmation));
          }
          this.emitCart();
          void this.router.navigate(['/checkout/thanks']);
        });
      } else {
        this.store.state.update((s) => checkoutActions.setError(s, String(result.error)));
      }
    });
  }

  buildPlaceOrderRequest(
    fulfillmentType: FulfillmentType,
    contact: { email: string; name: string },
    delivery?: { address: string; city: string; zip: string },
    storeId?: string
  ): PlaceOrderRequest {
    const base = {
      fulfillmentType,
      email: contact.email,
      name: contact.name,
    };
    if (fulfillmentType === 'PICKUP') {
      return { ...base, storeId };
    }
    return { ...base, ...delivery };
  }
}
