import type { ExploreState } from './explore.state';

export const exploreActions = {
  loadHomeStart: (s: ExploreState): ExploreState => ({ ...s, loading: true, error: null }),
  loadHomeSuccess: (s: ExploreState, home: ExploreState['home']): ExploreState => ({
    ...s,
    loading: false,
    home,
  }),
  loadCategorySuccess: (s: ExploreState, category: ExploreState['category']): ExploreState => ({
    ...s,
    loading: false,
    category,
  }),
  loadStoresSuccess: (s: ExploreState, stores: ExploreState['stores']): ExploreState => ({
    ...s,
    loading: false,
    stores,
  }),
  loadRecommendationsSuccess: (
    s: ExploreState,
    recommendations: ExploreState['recommendations']
  ): ExploreState => ({ ...s, recommendations }),
  setError: (s: ExploreState, error: string): ExploreState => ({ ...s, loading: false, error }),
};
