import { checkoutActions } from './checkout.actions';
import { initialCheckoutState } from './checkout.state';

describe('checkoutActions', () => {
  it('loadStart marca loading y limpia error', () => {
    const next = checkoutActions.loadStart({ ...initialCheckoutState(), error: 'previo' });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('loadCartSuccess guarda cart y apaga loading', () => {
    const cart = { items: [], subtotal: 0, itemCount: 0 };
    const next = checkoutActions.loadCartSuccess(
      { ...initialCheckoutState(), loading: true },
      cart
    );
    expect(next.loading).toBe(false);
    expect(next.cart).toBe(cart);
  });

  it('loadStoresSuccess guarda stores', () => {
    const stores = [{ id: 's1', name: 'Store' }] as never;
    const next = checkoutActions.loadStoresSuccess(initialCheckoutState(), stores);
    expect(next.stores).toBe(stores);
  });

  it('orderSuccess apaga loading, fija confirmación y vacía carrito', () => {
    const confirmation = { orderId: 'O-1', message: 'ok', fulfillmentType: 'PICKUP' } as never;
    const state = {
      ...initialCheckoutState(),
      loading: true,
      cart: { items: [{ sku: 'x' } as never], subtotal: 10, itemCount: 1 },
    };
    const next = checkoutActions.orderSuccess(state, confirmation);
    expect(next.loading).toBe(false);
    expect(next.orderConfirmation).toBe(confirmation);
    expect(next.cart).toEqual({ items: [], subtotal: 0, itemCount: 0 });
  });

  it('syncCartBadge actualiza counts cuando itemCount > 0 y mantiene items previos', () => {
    const state = {
      ...initialCheckoutState(),
      cart: { items: [{ sku: 'a' } as never], subtotal: 50, itemCount: 1 },
    };
    const next = checkoutActions.syncCartBadge(state, { itemCount: 2, subtotal: 100 });
    expect(next.cart?.itemCount).toBe(2);
    expect(next.cart?.subtotal).toBe(100);
    expect(next.cart?.items).toHaveLength(1);
  });

  it('syncCartBadge vacía items cuando itemCount es 0', () => {
    const state = {
      ...initialCheckoutState(),
      cart: { items: [{ sku: 'a' } as never], subtotal: 50, itemCount: 1 },
    };
    const next = checkoutActions.syncCartBadge(state, { itemCount: 0, subtotal: 0 });
    expect(next.cart?.items).toEqual([]);
    expect(next.cart?.itemCount).toBe(0);
  });

  it('syncCartBadge tolera cart nulo', () => {
    const next = checkoutActions.syncCartBadge(initialCheckoutState(), {
      itemCount: 3,
      subtotal: 90,
    });
    expect(next.cart?.items).toEqual([]);
    expect(next.cart?.itemCount).toBe(3);
  });

  it('setError detiene loading y guarda mensaje', () => {
    const next = checkoutActions.setError(
      { ...initialCheckoutState(), loading: true },
      'falló'
    );
    expect(next.loading).toBe(false);
    expect(next.error).toBe('falló');
  });
});

describe('initialCheckoutState', () => {
  it('inicializa con valores vacíos', () => {
    const s = initialCheckoutState();
    expect(s.cart).toBeNull();
    expect(s.stores).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.orderConfirmation).toBeNull();
  });
});
