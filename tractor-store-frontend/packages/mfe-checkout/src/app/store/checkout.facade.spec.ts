import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  CDN_BASE_URL,
} from '../../../../shared-catalog/src/lib/tokens/api.tokens';
import { ok, err } from '../../../../shared-catalog/src/lib/result/result';

import { CheckoutFacade } from './checkout.facade';
import { CheckoutApiService } from '../data/checkout-api.service';

describe('CheckoutFacade', () => {
  let facade: CheckoutFacade;
  let apiMock: {
    getCart: jest.Mock;
    getStores: jest.Mock;
    updateQuantity: jest.Mock;
    placeOrder: jest.Mock;
  };
  let routerMock: { navigate: jest.Mock };

  const cart = { items: [], subtotal: 50, itemCount: 1 };

  beforeEach(() => {
    apiMock = {
      getCart: jest.fn().mockReturnValue(of(ok(cart))),
      getStores: jest.fn(),
      updateQuantity: jest.fn(),
      placeOrder: jest.fn(),
    };
    routerMock = { navigate: jest.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        CheckoutFacade,
        { provide: CheckoutApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock },
        { provide: CDN_BASE_URL, useValue: 'https://cdn.test' },
      ],
    });

    facade = TestBed.inject(CheckoutFacade);
  });

  it('cdnUrl resuelve la url completa', () => {
    expect(facade.cdnUrl('/scene/x.webp')).toContain('https://cdn.test');
  });

  it('loadCart éxito guarda carrito y apaga loading', () => {
    facade.loadCart();
    expect(facade.cart()).toBe(cart);
    expect(facade.loading()).toBe(false);
  });

  it('loadCart fallo setea error', () => {
    apiMock.getCart.mockReturnValue(of(err('boom')));
    facade.loadCart();
    expect(facade.error()).toBe('boom');
  });

  it('loadStores éxito guarda', () => {
    const stores = [{ id: 's1' }] as never;
    apiMock.getStores.mockReturnValue(of(ok(stores)));
    facade.loadStores();
    expect(facade.stores()).toBe(stores);
  });

  it('loadStores fallo ignorado', () => {
    apiMock.getStores.mockReturnValue(of(err('no')));
    facade.loadStores();
    expect(facade.stores()).toEqual([]);
  });

  it('updateQuantity éxito actualiza carrito', () => {
    const updated = { items: [], subtotal: 100, itemCount: 2 };
    apiMock.updateQuantity.mockReturnValue(of(ok(updated)));
    facade.updateQuantity('SKU-1', 2);
    expect(apiMock.updateQuantity).toHaveBeenCalledWith('SKU-1', 2);
    expect(facade.cart()).toBe(updated);
  });

  it('updateQuantity error mantiene estado', () => {
    apiMock.updateQuantity.mockReturnValue(of(err('no')));
    facade.updateQuantity('SKU-1', 2);
    expect(facade.cart()).toBeNull();
  });

  it('placeOrder éxito navega y guarda confirmación', () => {
    const confirmation = { orderId: 'O-1', message: 'ok', fulfillmentType: 'PICKUP' } as never;
    apiMock.placeOrder.mockReturnValue(of(ok(confirmation)));
    apiMock.getCart.mockReturnValueOnce(of(ok({ items: [], subtotal: 0, itemCount: 0 })));

    facade.placeOrder({
      fulfillmentType: 'PICKUP',
      email: 'a@b.c',
      name: 'A',
      storeId: 's1',
    } as never);

    expect(facade.orderConfirmation()).toBe(confirmation);
    expect(facade.orderId()).toBe('O-1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/checkout/thanks']);
  });

  it('placeOrder éxito sin cart-success igual fija confirmación', () => {
    const confirmation = { orderId: 'O-2' } as never;
    apiMock.placeOrder.mockReturnValue(of(ok(confirmation)));
    apiMock.getCart.mockReturnValueOnce(of(err('no')));

    facade.placeOrder({ fulfillmentType: 'PICKUP', email: 'a', name: 'b' } as never);

    expect(facade.orderConfirmation()).toBe(confirmation);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/checkout/thanks']);
  });

  it('placeOrder fallido setea error', () => {
    apiMock.placeOrder.mockReturnValue(of(err('boom')));
    facade.placeOrder({ fulfillmentType: 'PICKUP', email: 'a', name: 'b' } as never);
    expect(facade.error()).toBe('boom');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('syncFromBus reescribe contadores', () => {
    facade.syncFromBus({ itemCount: 7, subtotal: 333 });
    expect(facade.itemCount()).toBe(7);
    expect(facade.subtotal()).toBe(333);
  });

  it('buildPlaceOrderRequest arma payload PICKUP con storeId', () => {
    const req = facade.buildPlaceOrderRequest(
      'PICKUP',
      { email: 'a', name: 'b' },
      undefined,
      's1'
    );
    expect(req).toEqual({
      fulfillmentType: 'PICKUP',
      email: 'a',
      name: 'b',
      storeId: 's1',
    });
  });

  it('buildPlaceOrderRequest arma payload SHIPPING con delivery', () => {
    const req = facade.buildPlaceOrderRequest(
      'SHIPPING' as never,
      { email: 'a', name: 'b' },
      { address: 'calle', city: 'med', zip: '050' }
    );
    expect(req).toEqual({
      fulfillmentType: 'SHIPPING',
      email: 'a',
      name: 'b',
      address: 'calle',
      city: 'med',
      zip: '050',
    });
  });
});
