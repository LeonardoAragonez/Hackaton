import { signal } from '@angular/core';
import type { Cart, OrderConfirmation, Store } from '@tractor-store/shared-catalog';

export interface CheckoutState {
  cart: Cart | null;
  stores: Store[];
  loading: boolean;
  error: string | null;
  orderConfirmation: OrderConfirmation | null;
}

export const initialCheckoutState = (): CheckoutState => ({
  cart: null,
  stores: [],
  loading: false,
  error: null,
  orderConfirmation: null,
});

export const createCheckoutStore = () => ({
  state: signal<CheckoutState>(initialCheckoutState()),
});
