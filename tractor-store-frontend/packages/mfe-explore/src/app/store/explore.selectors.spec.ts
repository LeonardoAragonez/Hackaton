import { exploreSelectors } from './explore.selectors';
import type { ExploreState } from './explore.state';

describe('exploreSelectors', () => {
  const state: ExploreState = {
    home: { title: 'Home' } as never,
    category: null,
    stores: [],
    recommendations: {},
    loading: true,
    error: 'err',
  };

  it('selects home and flags', () => {
    expect(exploreSelectors.home(state)).toEqual({ title: 'Home' });
    expect(exploreSelectors.loading(state)).toBe(true);
    expect(exploreSelectors.error(state)).toBe('err');
  });
});
