import { mapBackendCart } from './cart.mapper';

describe('mapBackendCart', () => {
  it('maps backend DTO to frontend cart model', () => {
    const cart = mapBackendCart({
      sessionId: 'sess-1',
      items: [
        {
          sku: 'AU-01-SI',
          name: 'Classic Silver',
          image: '/img.webp',
          quantity: 2,
          unitPrice: 1000,
          lineTotal: 2000,
        },
      ],
      itemCount: 2,
      total: 2000,
    });

    expect(cart.itemCount).toBe(2);
    expect(cart.subtotal).toBe(2000);
    expect(cart.items[0]).toEqual({
      sku: 'AU-01-SI',
      name: 'Classic Silver',
      price: 1000,
      quantity: 2,
      image: '/img.webp',
    });
  });
});
