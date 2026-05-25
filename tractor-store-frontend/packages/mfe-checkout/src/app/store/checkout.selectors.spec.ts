import { checkoutSelectors } from './checkout.selectors';
import type { CheckoutState } from './checkout.state';

describe('checkoutSelectors', () => {
  it('derives cart metrics and order id', () => {
    const state: CheckoutState = {
      cart: { itemCount: 3, subtotal: 150, items: [] },
      stores: [],
      loading: false,
      error: null,
      orderConfirmation: {
        orderId: 'ORD-9',
        message: 'ok',
        fulfillmentType: 'PICKUP',
      },
    };
    expect(checkoutSelectors.itemCount(state)).toBe(3);
    expect(checkoutSelectors.subtotal(state)).toBe(150);
    expect(checkoutSelectors.orderId(state)).toBe('ORD-9');
  });

  it('defaults when cart is null', () => {
    const empty: CheckoutState = {
      cart: null,
      stores: [],
      loading: false,
      error: null,
      orderConfirmation: null,
    };
    expect(checkoutSelectors.itemCount(empty)).toBe(0);
    expect(checkoutSelectors.orderId(empty)).toBeNull();
  });

  it('exposes cart and error fields', () => {
    const state: CheckoutState = {
      cart: { itemCount: 1, subtotal: 10, items: [] },
      stores: [{ id: 's1', name: 'Store' } as never],
      loading: true,
      error: 'fail',
      orderConfirmation: null,
    };
    expect(checkoutSelectors.cart(state)?.itemCount).toBe(1);
    expect(checkoutSelectors.loading(state)).toBe(true);
    expect(checkoutSelectors.stores(state)).toHaveLength(1);
  });
});
