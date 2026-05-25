import { exploreActions } from './explore.actions';
import { initialExploreState } from './explore.state';

describe('exploreActions', () => {
  it('loadHomeStart marca loading y limpia error', () => {
    const next = exploreActions.loadHomeStart({ ...initialExploreState(), error: 'previo' });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('loadHomeSuccess guarda home y apaga loading', () => {
    const home = { teaser: [], categories: [] } as never;
    const next = exploreActions.loadHomeSuccess(
      { ...initialExploreState(), loading: true },
      home
    );
    expect(next.loading).toBe(false);
    expect(next.home).toBe(home);
  });

  it('loadCategorySuccess guarda categoria y apaga loading', () => {
    const cat = { key: 'classic', name: 'Classic', products: [] } as never;
    const next = exploreActions.loadCategorySuccess(
      { ...initialExploreState(), loading: true },
      cat
    );
    expect(next.loading).toBe(false);
    expect(next.category).toBe(cat);
  });

  it('loadStoresSuccess guarda stores y apaga loading', () => {
    const stores = [{ id: 's1' }] as never;
    const next = exploreActions.loadStoresSuccess(
      { ...initialExploreState(), loading: true },
      stores
    );
    expect(next.loading).toBe(false);
    expect(next.stores).toBe(stores);
  });

  it('loadRecommendationsSuccess agrega recomendaciones', () => {
    const recs = { 'CL-01': [{ sku: 'x' }] } as never;
    const next = exploreActions.loadRecommendationsSuccess(initialExploreState(), recs);
    expect(next.recommendations).toBe(recs);
  });

  it('setError detiene loading y guarda mensaje', () => {
    const next = exploreActions.setError(
      { ...initialExploreState(), loading: true },
      'boom'
    );
    expect(next.loading).toBe(false);
    expect(next.error).toBe('boom');
  });
});

describe('initialExploreState', () => {
  it('inicializa estado vacío', () => {
    const s = initialExploreState();
    expect(s.home).toBeNull();
    expect(s.category).toBeNull();
    expect(s.stores).toEqual([]);
    expect(s.recommendations).toEqual({});
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });
});
