import { decideActions } from './decide.actions';
import { initialDecideState } from './decide.state';

describe('decideActions', () => {
  it('loadStart marca loading y limpia error', () => {
    const next = decideActions.loadStart({ ...initialDecideState(), error: 'previo' });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('loadSuccess guarda producto y apaga loading', () => {
    const product = {
      name: 'P',
      id: '1',
      category: 'c',
      highlights: [],
      variants: [{ name: 'V', image: '', sku: 'SKU-1', color: 'g', price: 10 }],
    };
    const next = decideActions.loadSuccess(initialDecideState(), product);
    expect(next.loading).toBe(false);
    expect(next.product).toEqual(product);
  });

  it('selectSku reemplaza sku seleccionado y limpia mensaje del carrito', () => {
    const start = {
      ...initialDecideState(),
      cartMessage: 'anterior',
      cartMessageKind: 'success' as const,
    };
    const next = decideActions.selectSku(start, 'SKU-2');
    expect(next.selectedSku).toBe('SKU-2');
    expect(next.cartMessage).toBeNull();
    expect(next.cartMessageKind).toBeNull();
  });

  it('setError detiene loading y guarda mensaje', () => {
    const next = decideActions.setError(
      { ...initialDecideState(), loading: true },
      'falló'
    );
    expect(next.loading).toBe(false);
    expect(next.error).toBe('falló');
  });

  it('setStock guarda cantidad o null', () => {
    const a = decideActions.setStock(initialDecideState(), 7);
    const b = decideActions.setStock(initialDecideState(), null);
    expect(a.stockAvailable).toBe(7);
    expect(b.stockAvailable).toBeNull();
  });

  it('setRecommendations guarda la lista', () => {
    const recs = [
      { sku: 'X-1', name: 'Tractor X', image: '/x.webp', url: '/product/X-1', rgb: [0, 1, 2] },
    ];
    const next = decideActions.setRecommendations(initialDecideState(), recs);
    expect(next.recommendations).toEqual(recs);
  });

  it('setCartMessage actualiza mensaje y kind', () => {
    const next = decideActions.setCartMessage(initialDecideState(), 'agregado', 'success');
    expect(next.cartMessage).toBe('agregado');
    expect(next.cartMessageKind).toBe('success');

    const cleared = decideActions.setCartMessage(next, null, null);
    expect(cleared.cartMessage).toBeNull();
    expect(cleared.cartMessageKind).toBeNull();
  });
});

describe('initialDecideState', () => {
  it('inicializa estado vacío', () => {
    const s = initialDecideState();
    expect(s.product).toBeNull();
    expect(s.selectedSku).toBeNull();
    expect(s.recommendations).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.cartMessage).toBeNull();
    expect(s.cartMessageKind).toBeNull();
    expect(s.stockAvailable).toBeNull();
  });
});
