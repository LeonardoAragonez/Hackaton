import { decideSelectors } from './decide.selectors';
import type { DecideState } from './decide.state';

describe('decideSelectors', () => {
  it('selectedVariant resolves by sku', () => {
    const state: DecideState = {
      product: {
        name: 'P',
        id: '1',
        category: 'c',
        highlights: [],
        variants: [{ name: 'V', image: '', sku: 'SKU-1', color: 'g', price: 10 }],
      },
      selectedSku: 'SKU-1',
      recommendations: [],
      loading: false,
      error: null,
      cartMessage: null,
      cartMessageKind: null,
      stockAvailable: null,
    };
    expect(decideSelectors.selectedVariant(state)?.sku).toBe('SKU-1');
  });

  it('selectedVariant is undefined without product', () => {
    const empty: DecideState = {
      product: null,
      selectedSku: null,
      recommendations: [],
      loading: false,
      error: null,
      cartMessage: null,
      cartMessageKind: null,
      stockAvailable: null,
    };
    expect(decideSelectors.selectedVariant(empty)).toBeUndefined();
  });

  it('exposes loading and cart message fields', () => {
    const state: DecideState = {
      product: null,
      selectedSku: 'SKU-9',
      recommendations: [{ sku: 'x' } as never],
      loading: true,
      error: 'e',
      cartMessage: 'added',
      cartMessageKind: 'success',
      stockAvailable: 5,
    };
    expect(decideSelectors.product(state)).toBeNull();
    expect(decideSelectors.selectedSku(state)).toBe('SKU-9');
    expect(decideSelectors.loading(state)).toBe(true);
    expect(decideSelectors.error(state)).toBe('e');
    expect(decideSelectors.cartMessageKind(state)).toBe('success');
    expect(decideSelectors.cartMessage(state)).toBe('added');
    expect(decideSelectors.stockAvailable(state)).toBe(5);
    expect(decideSelectors.recommendations(state)).toHaveLength(1);
  });
});
