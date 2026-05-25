import { CATALOG_EVENTS, catalogEventBus } from './catalog.events';

describe('catalogEventBus', () => {
  it('emits and receives cart updated payload', () => {
    const handler = jest.fn();
    const off = catalogEventBus.on(CATALOG_EVENTS.CART_UPDATED, handler);
    catalogEventBus.emit(CATALOG_EVENTS.CART_UPDATED, { itemCount: 2, subtotal: 99 });
    expect(handler).toHaveBeenCalledWith({ itemCount: 2, subtotal: 99 });
    off();
  });

  it('unsubscribes with returned off function', () => {
    const handler = jest.fn();
    const off = catalogEventBus.on(CATALOG_EVENTS.STORE_SELECTED, handler);
    off();
    catalogEventBus.emit(CATALOG_EVENTS.STORE_SELECTED, {
      storeId: '1',
      storeName: 'North',
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
