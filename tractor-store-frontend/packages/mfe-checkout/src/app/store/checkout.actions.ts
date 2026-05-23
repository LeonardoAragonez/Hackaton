import type { CheckoutState } from './checkout.state';
import type { Cart, CartUpdatedPayload, OrderConfirmation, Store } from '@tractor-store/shared-catalog';

export const checkoutActions = {
  loadStart: (s: CheckoutState): CheckoutState => ({ ...s, loading: true, error: null }),
  loadCartSuccess: (s: CheckoutState, cart: Cart): CheckoutState => ({
    ...s,
    loading: false,
    cart,
  }),
  loadStoresSuccess: (s: CheckoutState, stores: Store[]): CheckoutState => ({
    ...s,
    stores,
  }),
  orderSuccess: (s: CheckoutState, confirmation: OrderConfirmation): CheckoutState => ({
    ...s,
    loading: false,
    orderConfirmation: confirmation,
    cart: { items: [], subtotal: 0, itemCount: 0 },
  }),
  syncCartBadge: (s: CheckoutState, payload: CartUpdatedPayload): CheckoutState => ({
    ...s,
    cart: {
      items: payload.itemCount === 0 ? [] : (s.cart?.items ?? []),
      itemCount: payload.itemCount,
      subtotal: payload.subtotal,
    },
  }),
  setError: (s: CheckoutState, error: string): CheckoutState => ({ ...s, loading: false, error }),
};
