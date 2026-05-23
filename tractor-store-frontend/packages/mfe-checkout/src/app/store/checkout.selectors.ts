import type { CheckoutState } from './checkout.state';

export const checkoutSelectors = {
  cart: (s: CheckoutState) => s.cart,
  loading: (s: CheckoutState) => s.loading,
  error: (s: CheckoutState) => s.error,
  orderConfirmation: (s: CheckoutState) => s.orderConfirmation,
  orderId: (s: CheckoutState) => s.orderConfirmation?.orderId ?? null,
  stores: (s: CheckoutState) => s.stores,
  itemCount: (s: CheckoutState) => s.cart?.itemCount ?? 0,
  subtotal: (s: CheckoutState) => s.cart?.subtotal ?? 0,
};
